const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// Validation middleware
const registerValidation = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ min: 2, max: 50 })
		.withMessage("Name must be between 2 and 50 characters"),
	body("email")
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long")
		.matches(/\d/)
		.withMessage("Password must contain at least one number"),
	body("role")
		.isIn(["student", "examiner", "coaching"])
		.withMessage("Invalid role"),
	body("phone")
		.optional()
		.matches(/^[+]?[\d\s-]+$/)
		.withMessage("Invalid phone number format"),
	body("institution")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Institution name is too long"),
	body("address")
		.optional()
		.trim()
		.isLength({ max: 200 })
		.withMessage("Address is too long"),
	body("city")
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage("City name is too long"),
];

const loginValidation = [
	body("email")
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
	body("password").notEmpty().withMessage("Password is required"),
];

const profileUpdateValidation = [
	body("name")
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage("Name must be between 2 and 50 characters"),
	body("phone")
		.optional()
		.matches(/^[+]?[\d\s-]+$/)
		.withMessage("Invalid phone number format"),
	body("institution")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Institution name is too long"),
	body("address")
		.optional()
		.trim()
		.isLength({ max: 200 })
		.withMessage("Address is too long"),
	body("city")
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage("City name is too long"),
];

const passwordResetValidation = [
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long")
		.matches(/\d/)
		.withMessage("Password must contain at least one number"),
];

// Auth routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.get("/me", authenticate, authController.getCurrentUser);
router.put(
	"/profile",
	authenticate,
	profileUpdateValidation,
	authController.updateProfile
);
router.post("/logout", authenticate, authController.logout);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
	"/forgot-password",
	[body("email").isEmail().withMessage("Please enter a valid email")],
	authController.forgotPassword
);
router.post(
	"/reset-password/:token",
	passwordResetValidation,
	authController.resetPassword
);

module.exports = router;
