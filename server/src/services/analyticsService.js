const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const Payment = require('../models/Payment');
const LiveClass = require('../models/LiveClass');
const VideoAnalytics = require('../models/VideoAnalytics');
const {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
} from 'date-fns';
const ExcelJS = require('exceljs');

const analyticsService = {
  // User Analytics
  getUserAnalytics: async (timeRange) => {
    try {
      const now = new Date();
      let startDate, endDate;

      switch (timeRange) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        default:
          throw new Error('Invalid time range');
      }

      // User growth
      const userGrowth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // User engagement
      const userEngagement = await User.aggregate([
        {
          $match: {
            lastActive: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$lastActive' },
            },
            activeUsers: { $sum: 1 },
            averageSessionDuration: { $avg: '$sessionDuration' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // User demographics
      const demographics = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            ageDistribution: {
              $push: {
                $floor: {
                  $divide: [
                    { $subtract: [now, '$profile.dateOfBirth'] },
                    365 * 24 * 60 * 60 * 1000,
                  ],
                },
              },
            },
            genderDistribution: { $push: '$profile.gender' },
            locationDistribution: { $push: '$profile.location' },
          },
        },
      ]);

      return {
        userGrowth,
        userEngagement,
        demographics,
      };
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      throw error;
    }
  },

  // Course Analytics
  getCourseAnalytics: async (timeRange) => {
    try {
      const now = new Date();
      let startDate, endDate;

      switch (timeRange) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        default:
          throw new Error('Invalid time range');
      }

      // Course enrollment trends
      const enrollmentTrends = await Course.aggregate([
        {
          $unwind: '$students',
        },
        {
          $match: {
            'students.enrolledAt': { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$students.enrolledAt' },
            },
            enrollments: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Course completion rates
      const completionRates = await Course.aggregate([
        {
          $unwind: '$students',
        },
        {
          $group: {
            _id: '$_id',
            title: { $first: '$title' },
            totalStudents: { $sum: 1 },
            completedStudents: {
              $sum: {
                $cond: [{ $eq: ['$students.status', 'completed'] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            title: 1,
            completionRate: {
              $multiply: [
                { $divide: ['$completedStudents', '$totalStudents'] },
                100,
              ],
            },
          },
        },
      ]);

      // Popular categories
      const popularCategories = await Course.aggregate([
        {
          $group: {
            _id: '$category',
            courses: { $sum: 1 },
            totalStudents: { $sum: { $size: '$students' } },
            averageRating: { $avg: '$rating' },
          },
        },
        { $sort: { totalStudents: -1 } },
      ]);

      // Module engagement
      const moduleEngagement = await Course.aggregate([
        { $unwind: '$modules' },
        { $unwind: '$students' },
        {
          $group: {
            _id: {
              moduleId: '$modules._id',
              moduleTitle: '$modules.title',
            },
            views: { $sum: { $size: '$modules.views' } },
            completions: { $sum: { $size: '$modules.completions' } },
            averageTimeSpent: { $avg: '$modules.averageTimeSpent' },
          },
        },
      ]);

      return {
        enrollmentTrends,
        completionRates,
        popularCategories,
        moduleEngagement,
      };
    } catch (error) {
      console.error('Error in getCourseAnalytics:', error);
      throw error;
    }
  },

  // Exam Analytics
  getExamAnalytics: async (timeRange) => {
    try {
      const now = new Date();
      let startDate, endDate;

      switch (timeRange) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        default:
          throw new Error('Invalid time range');
      }

      // Performance trends
      const performanceTrends = await Exam.aggregate([
        { $unwind: '$participants' },
        {
          $match: {
            'participants.submittedAt': { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$participants.submittedAt',
              },
            },
            averageScore: { $avg: '$participants.score' },
            participants: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Question analysis
      const questionAnalysis = await Exam.aggregate([
        { $unwind: '$questions' },
        { $unwind: '$participants' },
        {
          $group: {
            _id: '$questions._id',
            question: { $first: '$questions.text' },
            correctAnswers: {
              $sum: {
                $cond: [
                  { $eq: ['$participants.answers.isCorrect', true] },
                  1,
                  0,
                ],
              },
            },
            totalAttempts: { $sum: 1 },
          },
        },
        {
          $project: {
            question: 1,
            difficulty: {
              $multiply: [
                {
                  $divide: ['$correctAnswers', '$totalAttempts'],
                },
                100,
              ],
            },
          },
        },
      ]);

      // Time analysis
      const timeAnalysis = await Exam.aggregate([
        { $unwind: '$participants' },
        {
          $group: {
            _id: '$_id',
            title: { $first: '$title' },
            averageTimeTaken: { $avg: '$participants.timeTaken' },
            minTimeTaken: { $min: '$participants.timeTaken' },
            maxTimeTaken: { $max: '$participants.timeTaken' },
          },
        },
      ]);

      return {
        performanceTrends,
        questionAnalysis,
        timeAnalysis,
      };
    } catch (error) {
      console.error('Error in getExamAnalytics:', error);
      throw error;
    }
  },

  // Video Analytics
  getVideoAnalytics: async (timeRange) => {
    try {
      const now = new Date();
      let startDate, endDate;

      switch (timeRange) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        default:
          throw new Error('Invalid time range');
      }

      // Viewing patterns
      const viewingPatterns = await VideoAnalytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            views: { $sum: 1 },
            averageWatchTime: { $avg: '$watchTime' },
            completionRate: {
              $avg: {
                $cond: [{ $eq: ['$completed', true] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Quality metrics
      const qualityMetrics = await VideoAnalytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$quality',
            sessions: { $sum: 1 },
            averageBitrate: { $avg: '$bitrate' },
            bufferingEvents: { $sum: '$bufferingCount' },
          },
        },
      ]);

      return {
        viewingPatterns,
        qualityMetrics,
      };
    } catch (error) {
      console.error('Error in getVideoAnalytics:', error);
      throw error;
    }
  },

  // Generate Excel Report
  generateReport: async (type, timeRange) => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Online Examination Platform';
      workbook.created = new Date();

      switch (type) {
        case 'users': {
          const analytics = await analyticsService.getUserAnalytics(timeRange);
          const sheet = workbook.addWorksheet('User Analytics');

          // User Growth
          sheet.addRow(['User Growth']);
          sheet.addRow(['Date', 'New Users']);
          analytics.userGrowth.forEach((data) => {
            sheet.addRow([data._id, data.count]);
          });

          // User Engagement
          sheet.addRow([]);
          sheet.addRow(['User Engagement']);
          sheet.addRow(['Date', 'Active Users', 'Avg Session Duration (min)']);
          analytics.userEngagement.forEach((data) => {
            sheet.addRow([
              data._id,
              data.activeUsers,
              (data.averageSessionDuration / 60).toFixed(2),
            ]);
          });

          // Demographics
          sheet.addRow([]);
          sheet.addRow(['Demographics']);
          sheet.addRow(['Role', 'Count', 'Avg Age']);
          analytics.demographics.forEach((data) => {
            const avgAge =
              data.ageDistribution.reduce((a, b) => a + b, 0) /
              data.ageDistribution.length;
            sheet.addRow([data._id, data.count, avgAge.toFixed(1)]);
          });
          break;
        }

        case 'courses': {
          const analytics = await analyticsService.getCourseAnalytics(timeRange);
          const sheet = workbook.addWorksheet('Course Analytics');

          // Enrollment Trends
          sheet.addRow(['Enrollment Trends']);
          sheet.addRow(['Date', 'Enrollments']);
          analytics.enrollmentTrends.forEach((data) => {
            sheet.addRow([data._id, data.enrollments]);
          });

          // Completion Rates
          sheet.addRow([]);
          sheet.addRow(['Course Completion Rates']);
          sheet.addRow(['Course', 'Completion Rate (%)']);
          analytics.completionRates.forEach((data) => {
            sheet.addRow([data.title, data.completionRate.toFixed(2)]);
          });

          // Popular Categories
          sheet.addRow([]);
          sheet.addRow(['Popular Categories']);
          sheet.addRow(['Category', 'Courses', 'Students', 'Avg Rating']);
          analytics.popularCategories.forEach((data) => {
            sheet.addRow([
              data._id,
              data.courses,
              data.totalStudents,
              data.averageRating.toFixed(2),
            ]);
          });
          break;
        }

        case 'exams': {
          const analytics = await analyticsService.getExamAnalytics(timeRange);
          const sheet = workbook.addWorksheet('Exam Analytics');

          // Performance Trends
          sheet.addRow(['Performance Trends']);
          sheet.addRow(['Date', 'Average Score', 'Participants']);
          analytics.performanceTrends.forEach((data) => {
            sheet.addRow([
              data._id,
              data.averageScore.toFixed(2),
              data.participants,
            ]);
          });

          // Question Analysis
          sheet.addRow([]);
          sheet.addRow(['Question Analysis']);
          sheet.addRow(['Question', 'Difficulty (%)']);
          analytics.questionAnalysis.forEach((data) => {
            sheet.addRow([data.question, data.difficulty.toFixed(2)]);
          });

          // Time Analysis
          sheet.addRow([]);
          sheet.addRow(['Time Analysis']);
          sheet.addRow([
            'Exam',
            'Avg Time (min)',
            'Min Time (min)',
            'Max Time (min)',
          ]);
          analytics.timeAnalysis.forEach((data) => {
            sheet.addRow([
              data.title,
              (data.averageTimeTaken / 60).toFixed(2),
              (data.minTimeTaken / 60).toFixed(2),
              (data.maxTimeTaken / 60).toFixed(2),
            ]);
          });
          break;
        }

        case 'videos': {
          const analytics = await analyticsService.getVideoAnalytics(timeRange);
          const sheet = workbook.addWorksheet('Video Analytics');

          // Viewing Patterns
          sheet.addRow(['Viewing Patterns']);
          sheet.addRow([
            'Date',
            'Views',
            'Avg Watch Time (min)',
            'Completion Rate (%)',
          ]);
          analytics.viewingPatterns.forEach((data) => {
            sheet.addRow([
              data._id,
              data.views,
              (data.averageWatchTime / 60).toFixed(2),
              (data.completionRate * 100).toFixed(2),
            ]);
          });

          // Quality Metrics
          sheet.addRow([]);
          sheet.addRow(['Quality Metrics']);
          sheet.addRow([
            'Quality',
            'Sessions',
            'Avg Bitrate (Mbps)',
            'Buffering Events',
          ]);
          analytics.qualityMetrics.forEach((data) => {
            sheet.addRow([
              data._id,
              data.sessions,
              (data.averageBitrate / 1000000).toFixed(2),
              data.bufferingEvents,
            ]);
          });
          break;
        }

        default:
          throw new Error('Invalid report type');
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      console.error('Error in generateReport:', error);
      throw error;
    }
  },
};

module.exports = analyticsService;
