const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const {
	sendVerificationEmail,
	sendPasswordResetEmail,
} = require("../utils/email");
const crypto = require("crypto");

// Register user
exports.register = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password, role } = req.body;

		// Check if user already exists
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({
				error: "User already exists with this email",
			});
		}

		// Create user
		user = new User({
			name,
			email,
			password,
			role,
			profile: {
				phone: req.body.phone,
				institution: req.body.institution,
				address: req.body.address,
				city: req.body.city,
			},
		});

		// Generate email verification token
		const verificationToken = user.generateEmailVerificationToken();
		await user.save();

		// Send verification email
		await sendVerificationEmail(user.email, verificationToken);

		// Create JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		// Remove sensitive fields
		const userResponse = user.toJSON();

		res.status(201).json({
			token,
			user: userResponse,
			message: "Registration successful. Please verify your email.",
		});
	} catch (error) {
		console.error("Error in register:", error);
		res.status(500).json({
			error: "Registration failed",
			details:
				process.env.NODE_ENV === "development"
					? error.message
					: undefined,
		});
	}
};

// Verify email
exports.verifyEmail = async (req, res) => {
	try {
		const { token } = req.params;

		const hashedToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		const user = await User.findOne({
			emailVerificationToken: hashedToken,
			emailVerificationExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({
				error: "Invalid or expired verification token",
			});
		}

		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();

		res.json({
			message: "Email verified successfully",
		});
	} catch (error) {
		console.error("Error in verifyEmail:", error);
		res.status(500).json({ error: "Email verification failed" });
	}
};

// Login user
exports.login = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: "Invalid credentials" });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).json({ error: "Invalid credentials" });
		}

		// Check if email is verified
		if (!user.isEmailVerified) {
			return res.status(400).json({
				error: "Please verify your email before logging in",
			});
		}

		// Create JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		// Remove sensitive fields
		const userResponse = user.toJSON();

		res.json({
			token,
			user: userResponse,
		});
	} catch (error) {
		console.error("Error in login:", error);
		res.status(500).json({ error: "Login failed" });
	}
};

// Get current user
exports.getCurrentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.select("-password")
			.populate("subscription");
		res.json(user);
	} catch (error) {
		console.error("Error in getCurrentUser:", error);
		res.status(500).json({ error: "Failed to fetch user data" });
	}
};

// Update profile
exports.updateProfile = async (req, res) => {
	try {
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
		res.status(500).json({ error: "Profile update failed" });
	}
};

// Logout
exports.logout = async (req, res) => {
	try {
		// Since we're using JWT, we just need to tell the client to remove the token
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Error in logout:", error);
		res.status(500).json({ error: "Logout failed" });
	}
};

// Forgot password
exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Generate password reset token
		const resetToken = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// TODO: Send password reset email
		// This should be implemented using your email service

		res.json({ message: "Password reset instructions sent to your email" });
	} catch (error) {
		console.error("Error in forgotPassword:", error);
		res.status(500).json({ error: "Server error" });
	}
};

// Reset password
exports.resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({ error: "Invalid token" });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();

		res.json({ message: "Password reset successful" });
	} catch (error) {
		console.error("Error in resetPassword:", error);
		res.status(500).json({ error: "Server error" });
	}
};
