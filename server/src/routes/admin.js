const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuth, isAdmin } = require('../middleware/auth');

// Apply authentication and admin middleware to all routes
router.use(isAuth, isAdmin);

// Get overall statistics
router.get('/stats', adminController.getStats);

// Get payment analytics
router.get('/payments/analytics', adminController.getPaymentAnalytics);

// Get user analytics
router.get('/users/analytics', adminController.getUserAnalytics);

// Get course analytics
router.get('/courses/analytics', adminController.getCourseAnalytics);

// Get exam analytics
router.get('/exams/analytics', adminController.getExamAnalytics);

module.exports = router;
