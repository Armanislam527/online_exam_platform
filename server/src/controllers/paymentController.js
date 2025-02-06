const SSLCommerzPayment = require('sslcommerz-lts');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Exam = require('../models/Exam');
const { v4: uuidv4 } = require('uuid');

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.NODE_ENV === 'production';

// Initialize SSL Commerz
const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);

// Initialize payment
exports.initializePayment = async (req, res) => {
  try {
    const { amount, purpose, userId, examId } = req.body;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate unique transaction ID
    const transactionId = uuidv4();

    // Create payment record
    const payment = new Payment({
      user: userId,
      amount,
      purpose,
      transactionId,
      exam: examId,
      status: 'PENDING',
    });
    await payment.save();

    // Prepare data for SSL Commerz
    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${process.env.CLIENT_URL}/payment/success`,
      fail_url: `${process.env.CLIENT_URL}/payment/fail`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      ipn_url: `${process.env.API_URL}/api/payment/ipn`,
      shipping_method: 'No',
      product_name: purpose,
      product_category: 'Education',
      product_profile: 'general',
      cus_name: user.profile?.fullName || user.username,
      cus_email: user.email,
      cus_add1: user.profile?.address || 'N/A',
      cus_city: user.profile?.city || 'N/A',
      cus_country: 'Bangladesh',
      cus_phone: user.profile?.phone || 'N/A',
    };

    // Initialize payment with SSL Commerz
    const sslData = await sslcommerz.init(data);

    if (sslData?.GatewayPageURL) {
      res.json({
        paymentUrl: sslData.GatewayPageURL,
        transaction: payment,
      });
    } else {
      throw new Error('Failed to initialize payment');
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize payment. Please try again later.',
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Verify with SSL Commerz
    const response = await sslcommerz.validate(transactionId);
    
    if (response?.status === 'VALID' || response?.status === 'VALIDATED') {
      // Update payment status
      payment.status = 'COMPLETED';
      payment.paymentDetails = response;
      await payment.save();

      // If payment is for exam registration
      if (payment.purpose === 'exam_registration' && payment.exam) {
        const exam = await Exam.findById(payment.exam);
        if (exam) {
          // Add user to exam participants
          if (!exam.participants.includes(payment.user)) {
            exam.participants.push(payment.user);
            await exam.save();
          }
        }
      }

      res.json({
        success: true,
        transaction: payment,
      });
    } else {
      payment.status = 'FAILED';
      payment.paymentDetails = response;
      await payment.save();

      res.status(400).json({
        error: 'Payment validation failed',
        transaction: payment,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Failed to verify payment. Please contact support.',
    });
  }
};

// IPN (Instant Payment Notification) handler
exports.handleIPN = async (req, res) => {
  try {
    const { tran_id, status, val_id } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ transactionId: tran_id });
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Validate payment with SSL Commerz
    const response = await sslcommerz.validate(val_id);
    
    if (response?.status === 'VALID' || response?.status === 'VALIDATED') {
      payment.status = 'COMPLETED';
      payment.paymentDetails = response;
      await payment.save();

      // Handle exam registration
      if (payment.purpose === 'exam_registration' && payment.exam) {
        const exam = await Exam.findById(payment.exam);
        if (exam) {
          if (!exam.participants.includes(payment.user)) {
            exam.participants.push(payment.user);
            await exam.save();
          }
        }
      }
    } else {
      payment.status = 'FAILED';
      payment.paymentDetails = response;
      await payment.save();
    }

    res.status(200).send('IPN received');
  } catch (error) {
    console.error('IPN handling error:', error);
    res.status(500).send('IPN processing failed');
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('exam', 'title')
      .select('-paymentDetails');

    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment history',
    });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $match: {
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: '$purpose',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Payment stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment statistics',
    });
  }
};
