const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

// Send verification email
exports.sendVerificationEmail = async (email, token) => {
	const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

	const mailOptions = {
		from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
		to: email,
		subject: "Verify Your Email Address",
		html: `
      <h1>Welcome to Online Exam Platform!</h1>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      ">
        Verify Email
      </a>
      <p>If the button doesn't work, you can also click this link:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
	};

	await transporter.sendMail(mailOptions);
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, token) => {
	const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

	const mailOptions = {
		from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
		to: email,
		subject: "Reset Your Password",
		html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      ">
        Reset Password
      </a>
      <p>If the button doesn't work, you can also click this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `,
	};

	await transporter.sendMail(mailOptions);
};

// Send exam registration confirmation
exports.sendExamRegistrationEmail = async (email, examDetails) => {
	const mailOptions = {
		from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
		to: email,
		subject: `Registration Confirmed: ${examDetails.title}`,
		html: `
      <h1>Exam Registration Confirmed</h1>
      <h2>${examDetails.title}</h2>
      <p>Your registration for the exam has been confirmed. Here are the details:</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(
			examDetails.scheduledAt
		).toLocaleString()}</li>
        <li><strong>Duration:</strong> ${examDetails.duration} minutes</li>
        <li><strong>Total Questions:</strong> ${examDetails.totalQuestions}</li>
      </ul>
      <p>Please make sure to:</p>
      <ul>
        <li>Log in at least 15 minutes before the exam starts</li>
        <li>Have a stable internet connection</li>
        <li>Keep your webcam and microphone ready if required</li>
      </ul>
      <p>Good luck with your exam!</p>
    `,
	};

	await transporter.sendMail(mailOptions);
};

// Send exam result
exports.sendExamResultEmail = async (email, resultDetails) => {
	const mailOptions = {
		from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
		to: email,
		subject: `Exam Results: ${resultDetails.examTitle}`,
		html: `
      <h1>Your Exam Results</h1>
      <h2>${resultDetails.examTitle}</h2>
      <div style="
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 4px;
        margin: 20px 0;
      ">
        <h3>Score Summary</h3>
        <ul>
          <li><strong>Total Score:</strong> ${resultDetails.score}/${resultDetails.totalMarks}</li>
          <li><strong>Percentage:</strong> ${resultDetails.percentage}%</li>
          <li><strong>Correct Answers:</strong> ${resultDetails.correctAnswers}</li>
          <li><strong>Wrong Answers:</strong> ${resultDetails.wrongAnswers}</li>
          <li><strong>Negative Marks:</strong> ${resultDetails.negativeMarks}</li>
        </ul>
      </div>
      <p>You can view your detailed results and analysis by logging into your account.</p>
    `,
	};

	await transporter.sendMail(mailOptions);
};

// Send live class reminder
exports.sendLiveClassReminder = async (email, classDetails) => {
	const joinUrl = `${process.env.CLIENT_URL}/live-class/${classDetails.id}`;

	const mailOptions = {
		from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
		to: email,
		subject: `Reminder: Live Class - ${classDetails.title}`,
		html: `
      <h1>Live Class Reminder</h1>
      <h2>${classDetails.title}</h2>
      <p>Your live class is starting in 30 minutes. Here are the details:</p>
      <ul>
        <li><strong>Time:</strong> ${new Date(
			classDetails.scheduledAt
		).toLocaleString()}</li>
        <li><strong>Duration:</strong> ${classDetails.duration} minutes</li>
        <li><strong>Instructor:</strong> ${classDetails.instructor}</li>
      </ul>
      <a href="${joinUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      ">
        Join Class
      </a>
      <p>If the button doesn't work, you can also click this link:</p>
      <p><a href="${joinUrl}">${joinUrl}</a></p>
      <p>Please join the class a few minutes early to ensure everything is working properly.</p>
    `,
	};

	await transporter.sendMail(mailOptions);
};
