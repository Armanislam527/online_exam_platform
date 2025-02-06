const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { isAuth, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(isAuth);

// Get user analytics
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const analytics = await analyticsService.getUserAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Error in user analytics route:', error);
    res.status(500).json({ message: 'Failed to fetch user analytics' });
  }
});

// Get course analytics
router.get('/courses', isAdmin, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const analytics = await analyticsService.getCourseAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Error in course analytics route:', error);
    res.status(500).json({ message: 'Failed to fetch course analytics' });
  }
});

// Get exam analytics
router.get('/exams', isAdmin, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const analytics = await analyticsService.getExamAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Error in exam analytics route:', error);
    res.status(500).json({ message: 'Failed to fetch exam analytics' });
  }
});

// Get video analytics
router.get('/videos', isAdmin, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const analytics = await analyticsService.getVideoAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Error in video analytics route:', error);
    res.status(500).json({ message: 'Failed to fetch video analytics' });
  }
});

// Generate and download reports
router.get('/reports/:type', isAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { timeRange = 'week' } = req.query;
    
    const buffer = await analyticsService.generateReport(type, timeRange);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${type}-report-${timeRange}-${Date.now()}.xlsx`
    );
    
    res.send(buffer);
  } catch (error) {
    console.error('Error in generate report route:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

module.exports = router;
