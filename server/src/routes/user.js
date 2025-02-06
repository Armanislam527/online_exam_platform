const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const userController = require("../controllers/userController");

// Get all users (admin only)
router.get("/", auth, authorize("admin"), userController.getAllUsers);

// Get user by ID
router.get("/:userId", auth, userController.getUserById);

// Get user profile
router.get("/profile", auth, userController.getProfile);

// Update user profile
router.put("/profile", auth, userController.updateProfile);

// Get user's exam history
router.get("/exams", auth, userController.getExamHistory);

// Get user's course enrollments
router.get("/courses", auth, userController.getCourseEnrollments);

// Get user's analytics
router.get("/analytics", auth, userController.getUserAnalytics);

// Change password
router.put("/change-password", auth, userController.changePassword);

// Delete account
router.delete("/", auth, userController.deleteAccount);

module.exports = router;
