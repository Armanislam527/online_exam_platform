const mongoose = require("mongoose");

const coachingSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		description: {
			type: String,
			trim: true,
		},
		address: {
			type: String,
			trim: true,
		},
		contact: {
			phone: String,
			email: String,
			website: String,
		},
		courses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		],
		students: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		teachers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		subscription: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Subscription",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		logo: String,
		socialMedia: {
			facebook: String,
			twitter: String,
			instagram: String,
			linkedin: String,
		},
		ratings: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				rating: {
					type: Number,
					min: 1,
					max: 5,
				},
				review: String,
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		averageRating: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Add indexes
coachingSchema.index({ name: 1 });
coachingSchema.index({ admin: 1 });
coachingSchema.index({ "contact.email": 1 });

// Calculate average rating before saving
coachingSchema.pre("save", function (next) {
	if (this.ratings && this.ratings.length > 0) {
		const totalRating = this.ratings.reduce(
			(sum, rating) => sum + rating.rating,
			0
		);
		this.averageRating = totalRating / this.ratings.length;
	}
	next();
});

// Add methods
coachingSchema.methods.addStudent = async function (studentId) {
	if (!this.students.includes(studentId)) {
		this.students.push(studentId);
		await this.save();
	}
};

coachingSchema.methods.removeStudent = async function (studentId) {
	this.students = this.students.filter(
		(id) => id.toString() !== studentId.toString()
	);
	await this.save();
};

coachingSchema.methods.addTeacher = async function (teacherId) {
	if (!this.teachers.includes(teacherId)) {
		this.teachers.push(teacherId);
		await this.save();
	}
};

coachingSchema.methods.removeTeacher = async function (teacherId) {
	this.teachers = this.teachers.filter(
		(id) => id.toString() !== teacherId.toString()
	);
	await this.save();
};

coachingSchema.methods.addRating = async function (userId, rating, review) {
	const existingRatingIndex = this.ratings.findIndex(
		(r) => r.user.toString() === userId.toString()
	);

	if (existingRatingIndex !== -1) {
		this.ratings[existingRatingIndex] = { user: userId, rating, review };
	} else {
		this.ratings.push({ user: userId, rating, review });
	}

	await this.save();
};

const Coaching = mongoose.model("Coaching", coachingSchema);

module.exports = Coaching;
