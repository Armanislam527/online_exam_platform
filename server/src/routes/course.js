const express = require('express');
const router = express.Router();
const { isAuth, isInstructor } = require('../middleware/auth');
const courseController = require('../controllers/courseController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/course'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image, PDF, and video files are allowed!'));
  }
});

// Create a new course
router.post('/', isAuth, isInstructor, courseController.createCourse);

// Get all courses (with filters)
router.get('/', courseController.getCourses);

// Get course by ID
router.get('/:id', courseController.getCourseById);

// Update course
router.put('/:id', isAuth, isInstructor, courseController.updateCourse);

// Delete course
router.delete('/:id', isAuth, isInstructor, courseController.deleteCourse);

// Add module to course
router.post('/:id/modules', isAuth, isInstructor, courseController.addModule);

// Update module
router.put('/:id/modules/:moduleId', isAuth, isInstructor, courseController.updateModule);

// Delete module
router.delete('/:id/modules/:moduleId', isAuth, isInstructor, courseController.deleteModule);

// Upload course content
router.post(
  '/:id/modules/:moduleId/content',
  isAuth,
  isInstructor,
  upload.single('content'),
  courseController.uploadContent
);

// Enroll in course
router.post('/:id/enroll', isAuth, courseController.enrollCourse);

// Get course progress
router.get('/:id/progress', isAuth, courseController.getCourseProgress);

// Mark module as complete
router.post('/:id/modules/:moduleId/complete', isAuth, courseController.completeModule);

// Add course review
router.post('/:id/reviews', isAuth, courseController.addReview);

// Get course reviews
router.get('/:id/reviews', courseController.getReviews);

// Get course analytics
router.get('/:id/analytics', isAuth, isInstructor, courseController.getCourseAnalytics);

// Get recommended courses
router.get('/recommended/:userId', isAuth, courseController.getRecommendedCourses);

// Search courses
router.get('/search/:query', courseController.searchCourses);

// Get course categories
router.get('/categories/all', courseController.getCategories);

// Get courses by category
router.get('/category/:category', courseController.getCoursesByCategory);

module.exports = router;
