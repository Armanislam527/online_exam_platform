const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["subscription", "exam", "coaching"],
		},
		value: {
			type: Number,
			required: true,
			min: 0,
		},
		maxUses: {
			type: Number,
			default: 1,
		},
		usedCount: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		coaching: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coaching",
		},
		exam: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exam",
		},
		usedBy: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				usedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

// Add indexes
voucherSchema.index({ code: 1 }, { unique: true });
voucherSchema.index({ expiresAt: 1 });
voucherSchema.index({ createdBy: 1 });

// Check if voucher is valid
voucherSchema.methods.isValid = function () {
	return (
		this.isActive &&
		this.expiresAt > new Date() &&
		this.usedCount < this.maxUses
	);
};

// Use voucher
voucherSchema.methods.use = async function (userId) {
	if (!this.isValid()) {
		throw new Error("Voucher is not valid");
	}

	this.usedCount += 1;
	this.usedBy.push({ user: userId });

	if (this.usedCount >= this.maxUses) {
		this.isActive = false;
	}

	await this.save();
	return true;
};

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
