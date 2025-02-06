const { validationResult } = require("express-validator");
const User = require("../models/User");
const Exam = require("../models/Exam");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const bcrypt = require("bcryptjs");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find()
			.select("-password")
			.sort({ createdAt: -1 });
		res.json(users);
	} catch (error) {
		console.error("Error in getAllUsers:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user by ID
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId)
			.select("-password")
			.populate("subscription");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getUserById:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user profile
exports.getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		res.json(user);
	} catch (error) {
		console.error("Error in getProfile:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Update profile
exports.updateProfile = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const updates = {
			name: req.body.name,
			profile: {
				phone: req.body.phone,
				institution: req.body.institution,
				address: req.body.address,
				city: req.body.city,
			},
		};

		const user = await User.findByIdAndUpdate(req.user._id, updates, {
			new: true,
			runValidators: true,
		}).select("-password");

		res.json(user);
	} catch (error) {
		console.error("Error in updateProfile:", error);
		res.status(500).json({ message: "Profile update failed" });
	}
};

// Get user's exam history
exports.getExamHistory = async (req, res) => {
	try {
		const exams = await Exam.find({
			"participants.user": req.user._id,
		})
			.select("title startTime endTime totalMarks participants")
			.sort({ startTime: -1 });

		const examHistory = exams.map((exam) => {
			const participation = exam.participants.find(
				(p) => p.user.toString() === req.user._id.toString()
			);
			return {
				examId: exam._id,
				title: exam.title,
				startTime: participation.startTime,
				endTime: participation.endTime,
				totalMarks: exam.totalMarks,
				score: participation.totalScore,
				status: participation.status,
			};
		});

		res.json(examHistory);
	} catch (error) {
		console.error("Error in getExamHistory:", error);
		res.status(500).json({ message: "Failed to fetch exam history" });
	}
};

// Get user's course enrollments
exports.getCourseEnrollments = async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
			.populate("courseEnrollments")
			.select("courseEnrollments");
		res.json(user.courseEnrollments);
	} catch (error) {
		console.error("Error in getCourseEnrollments:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user's analytics
exports.getUserAnalytics = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		// Add your analytics logic here
		res.json({
			totalExams: user.examHistory.length,
			totalCourses: user.courseEnrollments.length,
			// Add more analytics data as needed
		});
	} catch (error) {
		console.error("Error in getUserAnalytics:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Change password
exports.changePassword = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { currentPassword, newPassword } = req.body;

		// Get user with password
		const user = await User.findById(req.user._id);

		// Check current password
		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return res
				.status(400)
				.json({ message: "Current password is incorrect" });
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Error in changePassword:", error);
		res.status(500).json({ message: "Password change failed" });
	}
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
	try {
		const payments = await Payment.find({ user: req.user._id })
			.sort({ createdAt: -1 })
			.populate("metadata.examId", "title")
			.populate("metadata.coachingId", "name");

		res.json(payments);
	} catch (error) {
		console.error("Error in getPaymentHistory:", error);
		res.status(500).json({ message: "Failed to fetch payment history" });
	}
};

// Get subscription history
exports.getSubscriptionHistory = async (req, res) => {
	try {
		const subscriptions = await Subscription.find({
			user: req.user._id,
		}).sort({ startDate: -1 });

		res.json(subscriptions);
	} catch (error) {
		console.error("Error in getSubscriptionHistory:", error);
		res.status(500).json({
			message: "Failed to fetch subscription history",
		});
	}
};

// Deactivate account
exports.deactivateAccount = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ isActive: false },
			{ new: true }
		).select("-password");

		res.json({
			message: "Account deactivated successfully",
			user,
		});
	} catch (error) {
		console.error("Error in deactivateAccount:", error);
		res.status(500).json({ message: "Failed to deactivate account" });
	}
};

// Reactivate account
exports.reactivateAccount = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ isActive: true },
			{ new: true }
		).select("-password");

		res.json({
			message: "Account reactivated successfully",
			user,
		});
	} catch (error) {
		console.error("Error in reactivateAccount:", error);
		res.status(500).json({ message: "Failed to reactivate account" });
	}
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{
				"profile.avatar": req.file.location, // Assuming using S3 or similar
			},
			{ new: true }
		).select("-password");

		res.json({
			message: "Profile picture updated successfully",
			user,
		});
	} catch (error) {
		console.error("Error in uploadProfilePicture:", error);
		res.status(500).json({ message: "Failed to upload profile picture" });
	}
};

// Delete account
exports.deleteAccount = async (req, res) => {
	try {
		await User.findByIdAndDelete(req.user.id);
		res.json({ message: "Account deleted successfully" });
	} catch (error) {
		console.error("Error in deleteAccount:", error);
		res.status(500).json({ message: "Server error" });
	}
};
