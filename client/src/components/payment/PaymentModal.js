import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	Typography,
	CircularProgress,
	Alert,
	Divider,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	FormLabel,
} from "@mui/material";
import {
	initiatePayment,
	validateVoucher,
} from "../../services/paymentService";

function PaymentModal({ open, onClose, amount, purpose, onSuccess }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("sslcommerz");
	const [voucherCode, setVoucherCode] = useState("");
	const [voucherApplied, setVoucherApplied] = useState(false);
	const [discountedAmount, setDiscountedAmount] = useState(amount);

	const handleVoucherValidation = async () => {
		try {
			setLoading(true);
			setError("");
			const result = await validateVoucher(voucherCode);
			setVoucherApplied(true);
			setDiscountedAmount(result.discountedAmount);
			setError("");
		} catch (error) {
			setError(error.message);
			setVoucherApplied(false);
			setDiscountedAmount(amount);
		} finally {
			setLoading(false);
		}
	};

	const handlePayment = async () => {
		try {
			setLoading(true);
			setError("");

			const paymentData = {
				amount: discountedAmount,
				purpose,
				paymentMethod,
				voucherCode: voucherApplied ? voucherCode : null,
			};

			const result = await initiatePayment(paymentData);

			if (paymentMethod === "sslcommerz") {
				// Redirect to SSLCommerz payment gateway
				window.location.href = result.redirectUrl;
			} else {
				// Handle voucher-only payment
				onSuccess(result);
				onClose();
			}
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Payment Details</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Box sx={{ mb: 3 }}>
					<Typography variant="h6" gutterBottom>
						Amount to Pay: ৳{discountedAmount}
					</Typography>
					{voucherApplied && amount !== discountedAmount && (
						<Typography variant="body2" color="success.main">
							Original amount: ৳{amount} (Voucher discount
							applied)
						</Typography>
					)}
				</Box>

				<FormControl component="fieldset" sx={{ mb: 3 }}>
					<FormLabel component="legend">Payment Method</FormLabel>
					<RadioGroup
						value={paymentMethod}
						onChange={(e) => setPaymentMethod(e.target.value)}>
						<FormControlLabel
							value="sslcommerz"
							control={<Radio />}
							label="Pay with Card/Mobile Banking"
						/>
						<FormControlLabel
							value="voucher"
							control={<Radio />}
							label="Pay with Voucher"
						/>
					</RadioGroup>
				</FormControl>

				{paymentMethod === "voucher" && (
					<>
						<Divider sx={{ my: 2 }} />
						<Box sx={{ mb: 2 }}>
							<TextField
								fullWidth
								label="Voucher Code"
								value={voucherCode}
								onChange={(e) => setVoucherCode(e.target.value)}
								disabled={loading}
								sx={{ mb: 1 }}
							/>
							<Button
								variant="outlined"
								onClick={handleVoucherValidation}
								disabled={!voucherCode || loading}>
								{loading ? (
									<CircularProgress size={24} />
								) : (
									"Apply Voucher"
								)}
							</Button>
						</Box>
					</>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handlePayment}
					disabled={
						loading ||
						(paymentMethod === "voucher" && !voucherApplied)
					}>
					{loading ? (
						<CircularProgress size={24} />
					) : (
						"Proceed to Payment"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default PaymentModal;
