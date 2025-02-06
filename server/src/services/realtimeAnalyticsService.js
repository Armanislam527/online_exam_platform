const Redis = require('redis');
const { promisify } = require('util');
const socketService = require('./socketService');

// Configure Redis client
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

// Promisify Redis commands
const hget = promisify(redisClient.hget).bind(redisClient);
const hset = promisify(redisClient.hset).bind(redisClient);
const hincrby = promisify(redisClient.hincrby).bind(redisClient);
const hgetall = promisify(redisClient.hgetall).bind(redisClient);
const expire = promisify(redisClient.expire).bind(redisClient);

const realtimeAnalyticsService = {
  // Track user activity
  trackUserActivity: async (userId, action, metadata = {}) => {
    try {
      const timestamp = Date.now();
      const key = `user:activity:${userId}`;
      
      await hset(key, {
        lastAction: action,
        lastTimestamp: timestamp,
        ...metadata,
      });
      
      // Set expiry for user activity (24 hours)
      await expire(key, 24 * 60 * 60);

      // Emit real-time update
      socketService.emitToAdmins('userActivity', {
        userId,
        action,
        timestamp,
        metadata,
      });

      // Update active users count
      await hincrby('platform:stats', 'activeUsers', 1);
    } catch (error) {
      console.error('Error in trackUserActivity:', error);
      throw error;
    }
  },

  // Track video engagement
  trackVideoEngagement: async (videoId, userId, action, metadata = {}) => {
    try {
      const timestamp = Date.now();
      const key = `video:engagement:${videoId}`;

      switch (action) {
        case 'play':
          await hincrby(key, 'plays', 1);
          await hset(`${key}:users`, userId, 'watching');
          break;
        case 'pause':
          await hset(`${key}:users`, userId, 'paused');
          break;
        case 'seek':
          await hincrby(key, 'seeks', 1);
          break;
        case 'quality':
          await hincrby(`${key}:quality:${metadata.quality}`, 'switches', 1);
          break;
        case 'buffer':
          await hincrby(key, 'bufferEvents', 1);
          break;
        case 'complete':
          await hincrby(key, 'completions', 1);
          await hset(`${key}:users`, userId, 'completed');
          break;
      }

      // Update watch time
      if (metadata.watchTime) {
        await hincrby(key, 'totalWatchTime', metadata.watchTime);
      }

      // Emit real-time update
      socketService.emitToAdmins('videoEngagement', {
        videoId,
        userId,
        action,
        timestamp,
        metadata,
      });
    } catch (error) {
      console.error('Error in trackVideoEngagement:', error);
      throw error;
    }
  },

  // Track exam progress
  trackExamProgress: async (examId, userId, action, metadata = {}) => {
    try {
      const timestamp = Date.now();
      const key = `exam:progress:${examId}`;

      switch (action) {
        case 'start':
          await hincrby(key, 'participants', 1);
          await hset(`${key}:users`, userId, 'started');
          break;
        case 'answer':
          await hincrby(key, 'totalAnswers', 1);
          if (metadata.correct) {
            await hincrby(key, 'correctAnswers', 1);
          }
          break;
        case 'complete':
          await hincrby(key, 'completions', 1);
          await hset(`${key}:users`, userId, 'completed');
          break;
      }

      // Emit real-time update
      socketService.emitToAdmins('examProgress', {
        examId,
        userId,
        action,
        timestamp,
        metadata,
      });
    } catch (error) {
      console.error('Error in trackExamProgress:', error);
      throw error;
    }
  },

  // Track course engagement
  trackCourseEngagement: async (courseId, userId, action, metadata = {}) => {
    try {
      const timestamp = Date.now();
      const key = `course:engagement:${courseId}`;

      switch (action) {
        case 'enroll':
          await hincrby(key, 'enrollments', 1);
          await hset(`${key}:users`, userId, 'enrolled');
          break;
        case 'start':
          await hincrby(key, 'activeStudents', 1);
          await hset(`${key}:users`, userId, 'active');
          break;
        case 'complete':
          await hincrby(key, 'completions', 1);
          await hset(`${key}:users`, userId, 'completed');
          break;
        case 'rate':
          await hincrby(key, 'ratings', 1);
          await hincrby(key, 'totalRating', metadata.rating);
          break;
      }

      // Emit real-time update
      socketService.emitToAdmins('courseEngagement', {
        courseId,
        userId,
        action,
        timestamp,
        metadata,
      });
    } catch (error) {
      console.error('Error in trackCourseEngagement:', error);
      throw error;
    }
  },

  // Get real-time platform statistics
  getPlatformStats: async () => {
    try {
      const stats = await hgetall('platform:stats');
      return {
        activeUsers: parseInt(stats.activeUsers || '0'),
        totalSessions: parseInt(stats.totalSessions || '0'),
        currentExams: parseInt(stats.currentExams || '0'),
        activeLiveClasses: parseInt(stats.activeLiveClasses || '0'),
      };
    } catch (error) {
      console.error('Error in getPlatformStats:', error);
      throw error;
    }
  },

  // Get real-time video analytics
  getVideoAnalytics: async (videoId) => {
    try {
      const key = `video:engagement:${videoId}`;
      const stats = await hgetall(key);
      const qualityStats = await hgetall(`${key}:quality`);
      const activeUsers = await hgetall(`${key}:users`);

      return {
        plays: parseInt(stats.plays || '0'),
        completions: parseInt(stats.completions || '0'),
        bufferEvents: parseInt(stats.bufferEvents || '0'),
        totalWatchTime: parseInt(stats.totalWatchTime || '0'),
        qualityStats,
        activeUsers: Object.entries(activeUsers).map(([userId, status]) => ({
          userId,
          status,
        })),
      };
    } catch (error) {
      console.error('Error in getVideoAnalytics:', error);
      throw error;
    }
  },

  // Get real-time exam analytics
  getExamAnalytics: async (examId) => {
    try {
      const key = `exam:progress:${examId}`;
      const stats = await hgetall(key);
      const participants = await hgetall(`${key}:users`);

      return {
        participants: parseInt(stats.participants || '0'),
        totalAnswers: parseInt(stats.totalAnswers || '0'),
        correctAnswers: parseInt(stats.correctAnswers || '0'),
        completions: parseInt(stats.completions || '0'),
        activeParticipants: Object.entries(participants).map(
          ([userId, status]) => ({
            userId,
            status,
          })
        ),
      };
    } catch (error) {
      console.error('Error in getExamAnalytics:', error);
      throw error;
    }
  },

  // Get real-time course analytics
  getCourseAnalytics: async (courseId) => {
    try {
      const key = `course:engagement:${courseId}`;
      const stats = await hgetall(key);
      const students = await hgetall(`${key}:users`);

      const totalRating = parseInt(stats.totalRating || '0');
      const ratings = parseInt(stats.ratings || '0');

      return {
        enrollments: parseInt(stats.enrollments || '0'),
        activeStudents: parseInt(stats.activeStudents || '0'),
        completions: parseInt(stats.completions || '0'),
        averageRating: ratings > 0 ? totalRating / ratings : 0,
        students: Object.entries(students).map(([userId, status]) => ({
          userId,
          status,
        })),
      };
    } catch (error) {
      console.error('Error in getCourseAnalytics:', error);
      throw error;
    }
  },
};

module.exports = realtimeAnalyticsService;
