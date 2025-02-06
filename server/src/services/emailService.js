const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Load and compile email templates
const loadTemplate = async (templateName) => {
  const templatePath = path.join(
    __dirname,
    '../templates/email',
    `${templateName}.hbs`
  );
  const template = await fs.readFile(templatePath, 'utf-8');
  return handlebars.compile(template);
};

// Email sending functions
const emailService = {
  // Send exam registration confirmation
  sendExamRegistration: async (user, exam) => {
    try {
      const template = await loadTemplate('examRegistration');
      const html = template({
        username: user.profile?.fullName || user.username,
        examTitle: exam.title,
        examDate: new Date(exam.startTime).toLocaleString(),
        duration: exam.duration,
        instructions: exam.instructions,
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: `Exam Registration Confirmation - ${exam.title}`,
        html,
      });
    } catch (error) {
      console.error('Error sending exam registration email:', error);
      throw error;
    }
  },

  // Send exam reminder
  sendExamReminder: async (user, exam) => {
    try {
      const template = await loadTemplate('examReminder');
      const html = template({
        username: user.profile?.fullName || user.username,
        examTitle: exam.title,
        examDate: new Date(exam.startTime).toLocaleString(),
        duration: exam.duration,
        instructions: exam.instructions,
        loginLink: `${process.env.CLIENT_URL}/exams/${exam._id}`,
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: `Reminder: Upcoming Exam - ${exam.title}`,
        html,
      });
    } catch (error) {
      console.error('Error sending exam reminder email:', error);
      throw error;
    }
  },

  // Send exam results
  sendExamResults: async (user, exam, results) => {
    try {
      const template = await loadTemplate('examResults');
      const html = template({
        username: user.profile?.fullName || user.username,
        examTitle: exam.title,
        score: results.score,
        totalMarks: exam.totalMarks,
        percentage: ((results.score / exam.totalMarks) * 100).toFixed(2),
        correctAnswers: results.correctAnswers,
        wrongAnswers: results.wrongAnswers,
        timeTaken: results.timeTaken,
        resultLink: `${process.env.CLIENT_URL}/exams/${exam._id}/results`,
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: `Exam Results - ${exam.title}`,
        html,
      });
    } catch (error) {
      console.error('Error sending exam results email:', error);
      throw error;
    }
  },

  // Send course enrollment confirmation
  sendCourseEnrollment: async (user, course) => {
    try {
      const template = await loadTemplate('courseEnrollment');
      const html = template({
        username: user.profile?.fullName || user.username,
        courseTitle: course.title,
        courseDuration: course.duration,
        moduleCount: course.modules?.length || 0,
        courseLink: `${process.env.CLIENT_URL}/courses/${course._id}`,
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: `Welcome to ${course.title}`,
        html,
      });
    } catch (error) {
      console.error('Error sending course enrollment email:', error);
      throw error;
    }
  },

  // Send live class notification
  sendLiveClassNotification: async (user, liveClass, course) => {
    try {
      const template = await loadTemplate('liveClassNotification');
      const html = template({
        username: user.profile?.fullName || user.username,
        courseTitle: course.title,
        classTitle: liveClass.title,
        startTime: new Date(liveClass.startTime).toLocaleString(),
        duration: liveClass.duration,
        description: liveClass.description,
        meetingLink: liveClass.meetingLink,
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: `Live Class Scheduled - ${liveClass.title}`,
        html,
      });
    } catch (error) {
      console.error('Error sending live class notification email:', error);
      throw error;
    }
  },

  // Send notice notification
  sendNoticeNotification: async (user, notice, coachingCenter) => {
    try {
      const template = await loadTemplate('noticeNotification');
      const html = template({
        username: user.profile?.fullName || user.username,
        coachingName: coachingCenter.name,
        noticeTitle: notice.title,
        noticeContent: notice.content,
        date: new Date(notice.createdAt).toLocaleString(),
        noticeLink: `${process.env.CLIENT_URL}/coaching/${coachingCenter._id}/notices`,
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: `New Notice: ${notice.title}`,
        html,
      });
    } catch (error) {
      console.error('Error sending notice notification email:', error);
      throw error;
    }
  },

  // Send payment confirmation
  sendPaymentConfirmation: async (user, payment, item) => {
    try {
      const template = await loadTemplate('paymentConfirmation');
      const html = template({
        username: user.profile?.fullName || user.username,
        amount: payment.amount,
        transactionId: payment.transactionId,
        purpose: payment.purpose,
        itemName: item.title,
        date: new Date(payment.createdAt).toLocaleString(),
        receiptLink: `${process.env.CLIENT_URL}/payments/${payment._id}/receipt`,
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: 'Payment Confirmation',
        html,
      });
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw error;
    }
  },

  // Send password reset
  sendPasswordReset: async (user, resetToken) => {
    try {
      const template = await loadTemplate('passwordReset');
      const html = template({
        username: user.profile?.fullName || user.username,
        resetLink: `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
        expiryTime: '1 hour',
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },
};

module.exports = emailService;
