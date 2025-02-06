const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		plan: {
			type: String,
			required: true,
			enum: ["basic", "premium", "enterprise"],
		},
		status: {
			type: String,
			required: true,
			enum: ["active", "expired", "cancelled"],
			default: "active",
		},
		startDate: {
			type: Date,
			required: true,
			default: Date.now,
		},
		endDate: {
			type: Date,
			required: true,
		},
		paymentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
			required: true,
		},
		features: {
			maxExams: Number,
			maxStudents: Number,
			maxQuestions: Number,
			allowLiveClass: Boolean,
			allowAnalytics: Boolean,
			allowCustomBranding: Boolean,
		},
	},
	{ timestamps: true }
);

// Add indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

// Add methods
subscriptionSchema.methods.isActive = function () {
	return this.status === "active" && this.endDate > new Date();
};

subscriptionSchema.methods.canCreateExam = function () {
	return this.isActive() && this.features.maxExams > 0;
};

subscriptionSchema.methods.canAddStudent = function () {
	return this.isActive() && this.features.maxStudents > 0;
};

subscriptionSchema.methods.canCreateLiveClass = function () {
	return this.isActive() && this.features.allowLiveClass;
};

// Add statics
subscriptionSchema.statics.findActiveSubscription = function (userId) {
	return this.findOne({
		user: userId,
		status: "active",
		endDate: { $gt: new Date() },
	}).sort({ endDate: -1 });
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
