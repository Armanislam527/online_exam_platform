const express = require('express');
const router = express.Router();
const { isAuth, isInstructor } = require('../middleware/auth');
const videoService = require('../services/videoService');
const transcriptionService = require('../services/transcriptionService');
const multer = require('multer');
const path = require('path');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/videos'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only video files are allowed!'));
  }
});

// Upload video
router.post('/upload', isAuth, isInstructor, upload.single('video'), async (req, res) => {
  try {
    const { courseId, moduleId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // Upload video and create HLS stream
    const result = await videoService.uploadVideo(file, courseId, moduleId);

    // Generate thumbnail
    const thumbnail = await videoService.generateThumbnail(file);

    // Start transcription process
    const languages = req.body.languages ? JSON.parse(req.body.languages) : ['en'];
    const transcriptionJob = await transcriptionService.processVideo(file.path, languages);

    res.json({
      message: 'Video uploaded successfully',
      videoId: result.videoId,
      playlistUrl: result.playlistUrl,
      thumbnail: thumbnail.thumbnailUrl,
      transcriptionJobId: transcriptionJob.jobName
    });
  } catch (error) {
    console.error('Error in video upload:', error);
    res.status(500).json({ message: 'Failed to upload video' });
  }
});

// Get video streaming URL
router.get('/:videoId/stream', isAuth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { courseId, moduleId } = req.query;

    const streamingUrl = await videoService.getStreamingUrl(videoId, courseId, moduleId);
    res.json({ url: streamingUrl });
  } catch (error) {
    console.error('Error getting streaming URL:', error);
    res.status(500).json({ message: 'Failed to get streaming URL' });
  }
});

// Get transcription status
router.get('/:videoId/transcription/:jobId', isAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await transcriptionService.checkTranscriptionStatus(jobId);
    res.json(status);
  } catch (error) {
    console.error('Error checking transcription status:', error);
    res.status(500).json({ message: 'Failed to check transcription status' });
  }
});

// Get video analytics
router.get('/:videoId/analytics', isAuth, isInstructor, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { courseId, moduleId } = req.query;

    const analytics = await videoService.getVideoAnalytics(videoId, courseId, moduleId);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting video analytics:', error);
    res.status(500).json({ message: 'Failed to get video analytics' });
  }
});

// Search video transcripts
router.get('/search', isAuth, async (req, res) => {
  try {
    const { query, videoId } = req.query;
    const results = await transcriptionService.searchTranscripts(query, videoId);
    res.json(results);
  } catch (error) {
    console.error('Error searching transcripts:', error);
    res.status(500).json({ message: 'Failed to search transcripts' });
  }
});

// Delete video
router.delete('/:videoId', isAuth, isInstructor, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { courseId, moduleId } = req.query;

    await videoService.deleteVideo(videoId, courseId, moduleId);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Failed to delete video' });
  }
});

module.exports = router;
