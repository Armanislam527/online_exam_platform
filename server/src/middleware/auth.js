const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Exam = require("../models/Exam");
const Coaching = require("../models/Coaching");

// Authenticate user
const authenticate = async (req, res, next) => {
	try {
		// Get token from header
		const token = req.header("Authorization")?.replace("Bearer ", "");
		if (!token) {
			return res.status(401).json({
				message: "Authentication required",
			});
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Find user
		const user = await User.findById(decoded.userId).select("-password");
		if (!user) {
			return res.status(401).json({
				message: "Authentication failed",
			});
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(401).json({
				message: "Your account has been deactivated",
			});
		}

		// Add user to request
		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(401).json({
			message: "Authentication failed",
		});
	}
};

// Check role
const authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				message: "You do not have permission to perform this action",
			});
		}
		next();
	};
};

// Check subscription
const checkSubscription = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id).populate("subscription");

		if (!user.subscription || !user.subscription.isActive()) {
			return res.status(403).json({
				message: "This action requires an active subscription",
			});
		}

		next();
	} catch (error) {
		console.error("Subscription check error:", error);
		res.status(500).json({
			message: "Failed to verify subscription",
		});
	}
};

// Check exam creator
const checkExamCreator = async (req, res, next) => {
	try {
		const examId = req.params.examId;
		const exam = await Exam.findById(examId);

		if (!exam) {
			return res.status(404).json({
				message: "Exam not found",
			});
		}

		if (exam.creator.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: "You do not have permission to modify this exam",
			});
		}

		req.exam = exam;
		next();
	} catch (error) {
		console.error("Exam creator check error:", error);
		res.status(500).json({
			message: "Failed to verify exam creator",
		});
	}
};

// Check coaching admin
const checkCoachingAdmin = async (req, res, next) => {
	try {
		const coachingId = req.params.coachingId;
		const coaching = await Coaching.findById(coachingId);

		if (!coaching) {
			return res.status(404).json({
				message: "Coaching center not found",
			});
		}

		if (coaching.admin.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message:
					"You do not have permission to modify this coaching center",
			});
		}

		req.coaching = coaching;
		next();
	} catch (error) {
		console.error("Coaching admin check error:", error);
		res.status(500).json({
			message: "Failed to verify coaching admin",
		});
	}
};

module.exports = {
	authenticate,
	authorize,
	checkSubscription,
	checkExamCreator,
	checkCoachingAdmin,
};
