const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		role: {
			type: String,
			required: true,
			enum: ["student", "examiner", "coaching", "admin"],
			default: "student",
		},
		profile: {
			phone: String,
			institution: String,
			address: String,
			city: String,
			avatar: String,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		subscription: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Subscription",
		},
		resetPasswordToken: String,
		resetPasswordExpires: Date,
		emailVerificationToken: String,
		emailVerificationExpires: Date,
	},
	{
		timestamps: true,
	}
);

// Add indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 10);
	}
	next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
	return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
	const verificationToken = crypto.randomBytes(32).toString("hex");
	this.emailVerificationToken = crypto
		.createHash("sha256")
		.update(verificationToken)
		.digest("hex");
	this.emailVerificationExpires = Date.now() + 86400000; // 24 hours
	return verificationToken;
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
	const user = this.toObject();
	delete user.password;
	delete user.resetPasswordToken;
	delete user.resetPasswordExpires;
	delete user.emailVerificationToken;
	delete user.emailVerificationExpires;
	return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

module.exports = User;
