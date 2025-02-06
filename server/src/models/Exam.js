const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	options: [
		{
			text: String,
			isCorrect: Boolean,
		},
	],
	category: {
		type: String,
		required: true,
	},
	subCategory: String,
	marks: {
		type: Number,
		required: true,
		default: 1,
	},
	negativeMarks: {
		type: Number,
		default: 0,
	},
	description: String,
	difficulty: {
		type: String,
		enum: ["easy", "medium", "hard"],
		default: "medium",
	},
});

const examSchema = new mongoose.Schema(
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
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		questions: [questionSchema],
		duration: {
			type: Number, // in minutes
			required: true,
			min: 1,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: true,
		},
		totalMarks: {
			type: Number,
			required: true,
			min: 0,
		},
		passingMarks: {
			type: Number,
			required: true,
			min: 0,
		},
		category: {
			type: String,
			required: true,
		},
		subCategory: String,
		instructions: String,
		status: {
			type: String,
			enum: ["draft", "published", "completed", "cancelled"],
			default: "draft",
		},
		price: {
			type: Number,
			default: 0,
			min: 0,
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
		allowReview: {
			type: Boolean,
			default: true,
		},
		shuffleQuestions: {
			type: Boolean,
			default: true,
		},
		shuffleOptions: {
			type: Boolean,
			default: true,
		},
		showResult: {
			type: Boolean,
			default: true,
		},
		coaching: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coaching",
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
		participants: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				startTime: Date,
				endTime: Date,
				answers: [
					{
						question: {
							type: mongoose.Schema.Types.ObjectId,
						},
						selectedOption: {
							type: mongoose.Schema.Types.ObjectId,
						},
						isCorrect: Boolean,
						marksObtained: Number,
					},
				],
				totalScore: {
					type: Number,
					default: 0,
				},
				status: {
					type: String,
					enum: ["pending", "completed", "abandoned"],
					default: "pending",
				},
			},
		],
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Add indexes
examSchema.index({ creator: 1, status: 1 });
examSchema.index({ startTime: 1, endTime: 1 });
examSchema.index({ category: 1, subCategory: 1 });
examSchema.index({ title: "text", description: "text" });

// Add methods
examSchema.methods.addParticipant = async function (userId) {
	if (
		this.participants.some((p) => p.user.toString() === userId.toString())
	) {
		return false;
	}

	this.participants.push({
		user: userId,
		startTime: new Date(),
	});
	await this.save();
	return true;
};

examSchema.methods.submitExam = async function (userId, answers) {
	const participant = this.participants.find(
		(p) => p.user.toString() === userId.toString()
	);
	if (!participant) {
		return false;
	}

	let totalScore = 0;
	const submittedAnswers = answers.map((answer) => {
		const question = this.questions.id(answer.questionId);
		const selectedOption = question.options.id(answer.optionId);
		const isCorrect = selectedOption.isCorrect;
		const marksObtained = isCorrect
			? question.marks
			: -question.negativeMarks;

		totalScore += marksObtained;

		return {
			question: question._id,
			selectedOption: selectedOption._id,
			isCorrect,
			marksObtained,
		};
	});

	participant.answers = submittedAnswers;
	participant.totalScore = totalScore;
	participant.endTime = new Date();
	participant.status = "completed";

	await this.save();
	return {
		totalScore,
		totalMarks: this.totalMarks,
		passed: totalScore >= this.passingMarks,
	};
};

examSchema.methods.getResults = async function (userId) {
	const participant = this.participants.find(
		(p) => p.user.toString() === userId.toString()
	);
	if (!participant || participant.status !== "completed") {
		return null;
	}

	return {
		startTime: participant.startTime,
		endTime: participant.endTime,
		totalScore: participant.totalScore,
		totalMarks: this.totalMarks,
		passingMarks: this.passingMarks,
		passed: participant.totalScore >= this.passingMarks,
		answers: participant.answers,
	};
};

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
