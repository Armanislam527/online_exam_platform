const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
			default: "BDT",
		},
		purpose: {
			type: String,
			required: true,
			enum: ["subscription", "exam", "coaching"],
		},
		method: {
			type: String,
			required: true,
			enum: ["sslcommerz", "voucher"],
		},
		status: {
			type: String,
			required: true,
			enum: ["pending", "completed", "failed", "refunded"],
			default: "pending",
		},
		transactionId: {
			type: String,
			unique: true,
			sparse: true,
		},
		voucherCode: {
			type: String,
			sparse: true,
		},
		metadata: {
			examId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Exam",
			},
			coachingId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Coaching",
			},
			subscriptionPlan: String,
			subscriptionDuration: Number,
			sslcommerz: {
				validationId: String,
				bankTranId: String,
				cardType: String,
				cardNo: String,
				bankName: String,
				cardIssuer: String,
				cardBrand: String,
				cardSubBrand: String,
				cardIssuerCountry: String,
				cardIssuerCountryCode: String,
				currencyAmount: String,
				currencyRate: String,
				baseAmount: String,
				valueA: String,
				valueB: String,
				valueC: String,
				valueD: String,
			},
		},
	},
	{ timestamps: true }
);

// Add indexes
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ voucherCode: 1 }, { sparse: true });

// Add methods
paymentSchema.methods.markAsCompleted = async function (transactionData = {}) {
	this.status = "completed";
	this.transactionId = transactionData.transactionId;
	if (transactionData.sslcommerz) {
		this.metadata.sslcommerz = transactionData.sslcommerz;
	}
	await this.save();
};

paymentSchema.methods.markAsFailed = async function (reason) {
	this.status = "failed";
	this.metadata.failureReason = reason;
	await this.save();
};

// Add statics
paymentSchema.statics.findByTransactionId = function (transactionId) {
	return this.findOne({ transactionId });
};

paymentSchema.statics.findPendingPayments = function (userId) {
	return this.find({
		user: userId,
		status: "pending",
	}).sort({ createdAt: -1 });
};

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
