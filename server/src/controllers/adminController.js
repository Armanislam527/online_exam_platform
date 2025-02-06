const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const Payment = require('../models/Payment');
const LiveClass = require('../models/LiveClass');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } = require('date-fns');

const adminController = {
  // Get overall statistics
  getStats: async (req, res) => {
    try {
      const { timeRange } = req.query;
      const now = new Date();
      let startDate, endDate;

      if (timeRange === 'week') {
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      // Get user statistics
      const totalUsers = await User.countDocuments();
      const newUsers = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      // Get course statistics
      const activeCourses = await Course.countDocuments({ status: 'active' });
      const totalEnrollments = await Course.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $size: '$students' } },
          },
        },
      ]);

      // Get exam statistics
      const totalExams = await Exam.countDocuments();
      const examsTaken = await Exam.countDocuments({
        startTime: { $gte: startDate, $lte: endDate },
      });

      // Get revenue statistics
      const revenueAggregation = await Payment.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const totalRevenue = revenueAggregation[0]?.total || 0;

      // Get revenue data for chart
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const revenueData = await Promise.all(
        days.map(async (date) => {
          const dayStart = new Date(date.setHours(0, 0, 0, 0));
          const dayEnd = new Date(date.setHours(23, 59, 59, 999));
          const dayRevenue = await Payment.aggregate([
            {
              $match: {
                status: 'completed',
                createdAt: { $gte: dayStart, $lte: dayEnd },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ]);
          return {
            date: date.toISOString().split('T')[0],
            revenue: dayRevenue[0]?.total || 0,
          };
        })
      );

      // Get user distribution
      const userDistribution = await User.aggregate([
        {
          $group: {
            _id: '$role',
            value: { $sum: 1 },
          },
        },
        {
          $project: {
            name: '$_id',
            value: 1,
            _id: 0,
          },
        },
      ]);

      // Get recent activities
      const recentActivities = await Promise.all([
        Payment.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'username')
          .lean()
          .then((payments) =>
            payments.map((p) => ({
              type: 'payment',
              description: `${p.user.username} made a payment of ৳${p.amount}`,
              timestamp: p.createdAt,
            }))
          ),
        Exam.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('examiner', 'username')
          .lean()
          .then((exams) =>
            exams.map((e) => ({
              type: 'exam',
              description: `${e.examiner.username} created exam "${e.title}"`,
              timestamp: e.createdAt,
            }))
          ),
        Course.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('instructor', 'username')
          .lean()
          .then((courses) =>
            courses.map((c) => ({
              type: 'course',
              description: `${c.instructor.username} created course "${c.title}"`,
              timestamp: c.createdAt,
            }))
          ),
      ]).then((activities) =>
        activities
          .flat()
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)
      );

      // Get upcoming events
      const upcomingEvents = await LiveClass.find({
        startTime: { $gte: now },
      })
        .sort({ startTime: 1 })
        .limit(5)
        .populate('course', 'title')
        .lean()
        .then((classes) =>
          classes.map((c) => ({
            title: `${c.title} (${c.course.title})`,
            startTime: c.startTime,
          }))
        );

      // Get recent payments
      const recentPayments = await Payment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'username')
        .lean()
        .then((payments) =>
          payments.map((p) => ({
            transactionId: p.transactionId,
            user: p.user.username,
            purpose: p.purpose,
            amount: p.amount,
            status: p.status,
            date: p.createdAt,
          }))
        );

      // Get user activity (mock data - replace with actual analytics)
      const userActivity = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        users: Math.floor(Math.random() * 100),
      }));

      // Get popular courses
      const popularCourses = await Course.aggregate([
        {
          $project: {
            name: '$title',
            students: { $size: '$students' },
          },
        },
        { $sort: { students: -1 } },
        { $limit: 5 },
      ]);

      // Get course completion rates (mock data - replace with actual analytics)
      const courseCompletion = [
        { name: 'Completed', value: 60 },
        { name: 'In Progress', value: 30 },
        { name: 'Not Started', value: 10 },
      ];

      res.json({
        totalUsers,
        newUsers,
        activeCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        totalExams,
        examsTaken,
        totalRevenue,
        revenueThisWeek: totalRevenue,
        revenueData,
        userDistribution,
        recentActivities,
        upcomingEvents,
        recentPayments,
        userActivity,
        popularCourses,
        courseCompletion,
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({ message: 'Failed to fetch admin statistics' });
    }
  },

  // Get payment analytics
  getPaymentAnalytics: async (req, res) => {
    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const payments = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json(payments);
    } catch (error) {
      console.error('Error in getPaymentAnalytics:', error);
      res.status(500).json({ message: 'Failed to fetch payment analytics' });
    }
  },

  // Get user analytics
  getUserAnalytics: async (req, res) => {
    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const userGrowth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
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

      res.json(userGrowth);
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      res.status(500).json({ message: 'Failed to fetch user analytics' });
    }
  },

  // Get course analytics
  getCourseAnalytics: async (req, res) => {
    try {
      const courseStats = await Course.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStudents: { $sum: { $size: '$students' } },
            averageRating: { $avg: '$rating' },
          },
        },
      ]);

      res.json(courseStats);
    } catch (error) {
      console.error('Error in getCourseAnalytics:', error);
      res.status(500).json({ message: 'Failed to fetch course analytics' });
    }
  },

  // Get exam analytics
  getExamAnalytics: async (req, res) => {
    try {
      const examStats = await Exam.aggregate([
        {
          $group: {
            _id: null,
            totalExams: { $sum: 1 },
            averageScore: { $avg: '$averageScore' },
            totalParticipants: { $sum: { $size: '$participants' } },
          },
        },
      ]);

      res.json(examStats[0] || {});
    } catch (error) {
      console.error('Error in getExamAnalytics:', error);
      res.status(500).json({ message: 'Failed to fetch exam analytics' });
    }
  },
};

module.exports = adminController;
