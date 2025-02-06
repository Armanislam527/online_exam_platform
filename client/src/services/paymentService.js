import axiosInstance from "./axiosConfig";

export const initiatePayment = async (paymentData) => {
	try {
		const response = await axiosInstance.post(
			"/payment/initiate",
			paymentData
		);
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message || "Payment initiation failed";
		console.error("Payment error:", error);
		throw new Error(message);
	}
};

export const verifyPayment = async (transactionId) => {
	try {
		const response = await axiosInstance.post("/payment/verify", {
			transactionId,
		});
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message || "Payment verification failed";
		console.error("Payment verification error:", error);
		throw new Error(message);
	}
};

export const getPaymentHistory = async () => {
	try {
		const response = await axiosInstance.get("/payment/history");
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message || "Failed to fetch payment history";
		console.error("Payment history error:", error);
		throw new Error(message);
	}
};

export const validateVoucher = async (voucherCode) => {
	try {
		const response = await axiosInstance.post("/payment/voucher/validate", {
			code: voucherCode,
		});
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message || "Voucher validation failed";
		console.error("Voucher validation error:", error);
		throw new Error(message);
	}
};
