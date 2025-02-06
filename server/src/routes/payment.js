const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  initializePayment,
  verifyPayment,
  handleIPN,
  getPaymentHistory,
  getPaymentStats,
} = require('../controllers/paymentController');

// Initialize payment
router.post('/initialize', auth, initializePayment);

// Verify payment
router.post('/verify', auth, verifyPayment);

// IPN handler (no auth required as it's called by SSL Commerz)
router.post('/ipn', handleIPN);

// Get payment history
router.get('/history/:userId', auth, getPaymentHistory);

// Get payment statistics (admin only)
router.get('/stats', auth, getPaymentStats);

module.exports = router;
