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
		autoRenew: {
			type: Boolean,
			default: false,
		},
		renewalDate: Date,
		cancelledAt: Date,
		cancellationReason: String,
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		discount: {
			type: Number,
			default: 0,
			min: 0,
		},
		metadata: {
			lastBillingDate: Date,
			nextBillingDate: Date,
			billingCycle: String,
			paymentMethod: String,
			invoiceUrl: String,
		},
	},
	{
		timestamps: true,
	}
);

// Add indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ plan: 1 });

// Add methods
subscriptionSchema.methods.isActive = function () {
	return this.status === "active" && this.endDate > new Date();
};

subscriptionSchema.methods.cancel = async function (reason) {
	this.status = "cancelled";
	this.cancelledAt = new Date();
	this.cancellationReason = reason;
	this.autoRenew = false;
	await this.save();
};

subscriptionSchema.methods.renew = async function (duration) {
	const currentDate = new Date();
	this.startDate = this.endDate < currentDate ? currentDate : this.endDate;
	this.endDate = new Date(this.startDate.getTime() + duration);
	this.status = "active";
	this.cancelledAt = undefined;
	this.cancellationReason = undefined;
	await this.save();
};

subscriptionSchema.methods.updateFeatures = async function (features) {
	this.features = { ...this.features, ...features };
	await this.save();
};

// Add statics
subscriptionSchema.statics.findActiveSubscription = function (userId) {
	return this.findOne({
		user: userId,
		status: "active",
		endDate: { $gt: new Date() },
	}).sort({ endDate: -1 });
};

subscriptionSchema.statics.findExpiringSubscriptions = function (days = 7) {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return this.find({
		status: "active",
		endDate: {
			$gt: new Date(),
			$lt: date,
		},
		autoRenew: false,
	}).populate("user", "email name");
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
