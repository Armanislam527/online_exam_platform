const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		coaching: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coaching",
			required: true,
		},
		instructor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		duration: {
			type: Number, // in weeks
			required: true,
			min: 1,
		},
		schedule: [
			{
				day: {
					type: String,
					enum: [
						"Sunday",
						"Monday",
						"Tuesday",
						"Wednesday",
						"Thursday",
						"Friday",
						"Saturday",
					],
				},
				startTime: String,
				endTime: String,
			},
		],
		syllabus: [
			{
				week: Number,
				title: String,
				description: String,
				topics: [String],
			},
		],
		enrolledStudents: [
			{
				student: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				enrolledAt: {
					type: Date,
					default: Date.now,
				},
				status: {
					type: String,
					enum: ["active", "completed", "dropped"],
					default: "active",
				},
			},
		],
		materials: [
			{
				title: String,
				type: {
					type: String,
					enum: ["pdf", "video", "link", "other"],
				},
				url: String,
				uploadedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		assignments: [
			{
				title: String,
				description: String,
				dueDate: Date,
				totalMarks: Number,
			},
		],
		status: {
			type: String,
			enum: ["draft", "published", "archived"],
			default: "draft",
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		maxStudents: {
			type: Number,
			required: true,
		},
		tags: [String],
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
courseSchema.index({ coaching: 1, status: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ title: "text", description: "text" });

// Calculate average rating before saving
courseSchema.pre("save", function (next) {
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
courseSchema.methods.enrollStudent = async function (studentId) {
	if (
		this.enrolledStudents.length >= this.maxStudents ||
		this.enrolledStudents.some(
			(enrollment) =>
				enrollment.student.toString() === studentId.toString()
		)
	) {
		return false;
	}

	this.enrolledStudents.push({
		student: studentId,
		status: "active",
	});
	await this.save();
	return true;
};

courseSchema.methods.updateStudentStatus = async function (
	studentId,
	newStatus
) {
	const enrollment = this.enrolledStudents.find(
		(e) => e.student.toString() === studentId.toString()
	);
	if (enrollment) {
		enrollment.status = newStatus;
		await this.save();
		return true;
	}
	return false;
};

courseSchema.methods.addMaterial = async function (material) {
	this.materials.push(material);
	await this.save();
};

courseSchema.methods.addAssignment = async function (assignment) {
	this.assignments.push(assignment);
	await this.save();
};

courseSchema.methods.addRating = async function (userId, rating, review) {
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

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
