import axiosInstance from "./axiosConfig";

export const getSubscriptionPlans = async () => {
	try {
		const response = await axiosInstance.get("/subscription/plans");
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message ||
			"Failed to fetch subscription plans";
		console.error("Subscription plans error:", error);
		throw new Error(message);
	}
};

export const getCurrentSubscription = async () => {
	try {
		const response = await axiosInstance.get("/subscription/current");
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message ||
			"Failed to fetch current subscription";
		console.error("Current subscription error:", error);
		throw new Error(message);
	}
};

export const subscribeToExam = async (examId) => {
	try {
		const response = await axiosInstance.post("/subscription/exam", {
			examId,
		});
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message || "Failed to subscribe to exam";
		console.error("Exam subscription error:", error);
		throw new Error(message);
	}
};

export const subscribeToCoaching = async (coachingId) => {
	try {
		const response = await axiosInstance.post("/subscription/coaching", {
			coachingId,
		});
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message || "Failed to subscribe to coaching";
		console.error("Coaching subscription error:", error);
		throw new Error(message);
	}
};

export const getSubscriptionHistory = async () => {
	try {
		const response = await axiosInstance.get("/subscription/history");
		return response.data;
	} catch (error) {
		const message =
			error.response?.data?.message ||
			"Failed to fetch subscription history";
		console.error("Subscription history error:", error);
		throw new Error(message);
	}
};
