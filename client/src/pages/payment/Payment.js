import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  initializePayment,
  verifyPayment,
  clearPaymentUrl,
  clearSuccess,
} from '../../store/slices/paymentSlice';

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const {
    loading,
    error,
    paymentUrl,
    currentTransaction,
    success,
  } = useSelector((state) => state.payment);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get payment status from URL if redirected from SSL Commerz
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transactionId = params.get('tran_id');
    const status = params.get('status');

    if (transactionId && status) {
      dispatch(verifyPayment({ transactionId }));
    }
  }, [dispatch, location]);

  // Redirect to payment gateway when URL is received
  useEffect(() => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  }, [paymentUrl]);

  // Clear payment URL when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPaymentUrl());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handlePayment = () => {
    dispatch(
      initializePayment({
        amount: location.state?.amount || 500, // Default amount if not provided
        purpose: 'exam_registration',
        userId: user._id,
        examId,
      })
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircleIcon
              color="success"
              sx={{ fontSize: 60, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3 }}>
              Your transaction has been completed successfully.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Transaction ID: {currentTransaction?.transactionId}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Amount Paid: ৳{currentTransaction?.amount}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Payment Details
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 3 }}>
                Complete your payment using SSL Commerz secure payment gateway
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Amount to Pay
                      </Typography>
                      <Typography variant="h4" color="primary">
                        ৳{location.state?.amount || 500}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Methods Available:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item>
                      <img
                        src="/images/payment/visa.png"
                        alt="Visa"
                        height="30"
                      />
                    </Grid>
                    <Grid item>
                      <img
                        src="/images/payment/mastercard.png"
                        alt="Mastercard"
                        height="30"
                      />
                    </Grid>
                    <Grid item>
                      <img
                        src="/images/payment/bkash.png"
                        alt="bKash"
                        height="30"
                      />
                    </Grid>
                    <Grid item>
                      <img
                        src="/images/payment/nagad.png"
                        alt="Nagad"
                        height="30"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PaymentIcon />}
                  onClick={() => setShowConfirmation(true)}
                  fullWidth
                >
                  Proceed to Payment
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Exam Registration Fee
                </Typography>
                <Typography variant="h6">
                  ৳{location.state?.amount || 500}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Transaction Fee
                </Typography>
                <Typography variant="h6">৳0</Typography>
              </Box>
              <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="body2" color="textSecondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" color="primary">
                  ৳{location.state?.amount || 500}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Payment Confirmation Dialog */}
        <Dialog
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogContent>
            <Typography>
              You are about to make a payment of ৳
              {location.state?.amount || 500}. Do you want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowConfirmation(false);
                handlePayment();
              }}
            >
              Confirm Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Payment;
