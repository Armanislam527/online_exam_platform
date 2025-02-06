const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const cloudFront = new AWS.CloudFront();

const videoService = {
  // Upload video to S3 and create HLS segments
  uploadVideo: async (file, courseId, moduleId) => {
    try {
      const videoId = uuidv4();
      const inputPath = file.path;
      const outputDir = path.join(__dirname, '../temp', videoId);

      // Create temp directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Convert video to HLS format
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-hls_time 10',
            '-hls_list_size 0',
            '-hls_segment_filename',
            `${outputDir}/segment_%d.ts`,
          ])
          .output(`${outputDir}/playlist.m3u8`)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      // Upload segments to S3
      const files = await promisify(fs.readdir)(outputDir);
      const uploadPromises = files.map(async (fileName) => {
        const filePath = path.join(outputDir, fileName);
        const fileContent = await promisify(fs.readFile)(filePath);
        
        const s3Key = `courses/${courseId}/modules/${moduleId}/videos/${videoId}/${fileName}`;
        await s3.upload({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: s3Key,
          Body: fileContent,
          ContentType: fileName.endsWith('.m3u8')
            ? 'application/x-mpegURL'
            : 'video/MP2T',
        }).promise();

        // Clean up local file
        await promisify(fs.unlink)(filePath);
      });

      await Promise.all(uploadPromises);

      // Clean up temp directory
      await promisify(fs.rmdir)(outputDir);

      // Create CloudFront signed URL
      const signedUrl = cloudFront.getSignedUrl('getObject', {
        url: `${process.env.CLOUDFRONT_URL}/courses/${courseId}/modules/${moduleId}/videos/${videoId}/playlist.m3u8`,
        expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      });

      return {
        videoId,
        playlistUrl: signedUrl,
      };
    } catch (error) {
      console.error('Error in uploadVideo:', error);
      throw error;
    }
  },

  // Generate video thumbnail
  generateThumbnail: async (file) => {
    try {
      const thumbnailId = uuidv4();
      const outputPath = path.join(__dirname, '../temp', `${thumbnailId}.jpg`);

      await new Promise((resolve, reject) => {
        ffmpeg(file.path)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: `${thumbnailId}.jpg`,
            folder: path.dirname(outputPath),
            size: '320x240',
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Upload thumbnail to S3
      const thumbnailContent = await promisify(fs.readFile)(outputPath);
      const s3Key = `thumbnails/${thumbnailId}.jpg`;
      
      await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: thumbnailContent,
        ContentType: 'image/jpeg',
      }).promise();

      // Clean up local file
      await promisify(fs.unlink)(outputPath);

      return {
        thumbnailId,
        thumbnailUrl: `${process.env.CLOUDFRONT_URL}/${s3Key}`,
      };
    } catch (error) {
      console.error('Error in generateThumbnail:', error);
      throw error;
    }
  },

  // Get video streaming URL
  getStreamingUrl: async (videoId, courseId, moduleId) => {
    try {
      const signedUrl = cloudFront.getSignedUrl('getObject', {
        url: `${process.env.CLOUDFRONT_URL}/courses/${courseId}/modules/${moduleId}/videos/${videoId}/playlist.m3u8`,
        expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      });

      return signedUrl;
    } catch (error) {
      console.error('Error in getStreamingUrl:', error);
      throw error;
    }
  },

  // Delete video and its segments
  deleteVideo: async (videoId, courseId, moduleId) => {
    try {
      // List all objects with the video prefix
      const listParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `courses/${courseId}/modules/${moduleId}/videos/${videoId}/`,
      };

      const objects = await s3.listObjectsV2(listParams).promise();
      
      if (objects.Contents.length === 0) return;

      // Delete all objects
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Delete: {
          Objects: objects.Contents.map(({ Key }) => ({ Key })),
        },
      };

      await s3.deleteObjects(deleteParams).promise();

      // Invalidate CloudFront cache
      await cloudFront.createInvalidation({
        DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: String(Date.now()),
          Paths: {
            Quantity: 1,
            Items: [`/courses/${courseId}/modules/${moduleId}/videos/${videoId}/*`],
          },
        },
      }).promise();
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      throw error;
    }
  },

  // Get video analytics
  getVideoAnalytics: async (videoId, courseId, moduleId) => {
    try {
      // Get CloudWatch metrics for video playback
      const cloudWatch = new AWS.CloudWatch();
      const endTime = new Date();
      const startTime = new Date(endTime - 24 * 60 * 60 * 1000); // Last 24 hours

      const metrics = await cloudWatch.getMetricData({
        MetricDataQueries: [
          {
            Id: 'playbacks',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/CloudFront',
                MetricName: 'Requests',
                Dimensions: [
                  {
                    Name: 'DistributionId',
                    Value: process.env.CLOUDFRONT_DISTRIBUTION_ID,
                  },
                  {
                    Name: 'Region',
                    Value: 'Global',
                  },
                ],
              },
              Period: 3600,
              Stat: 'Sum',
            },
          },
        ],
        StartTime: startTime,
        EndTime: endTime,
      }).promise();

      return {
        playbacks: metrics.MetricDataResults[0].Values,
        timestamps: metrics.MetricDataResults[0].Timestamps,
      };
    } catch (error) {
      console.error('Error in getVideoAnalytics:', error);
      throw error;
    }
  },
};

module.exports = videoService;
