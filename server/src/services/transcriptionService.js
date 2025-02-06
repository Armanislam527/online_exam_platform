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

const transcribe = new AWS.TranscribeService();
const s3 = new AWS.S3();
const translate = new AWS.Translate();

const transcriptionService = {
  // Extract audio from video
  extractAudio: async (videoPath) => {
    try {
      const audioId = uuidv4();
      const outputPath = path.join(__dirname, '../temp', `${audioId}.mp3`);

      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .toFormat('mp3')
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      return {
        audioPath: outputPath,
        audioId,
      };
    } catch (error) {
      console.error('Error in extractAudio:', error);
      throw error;
    }
  },

  // Upload audio to S3
  uploadAudio: async (audioPath, audioId) => {
    try {
      const audioContent = await promisify(fs.readFile)(audioPath);
      const s3Key = `audio/${audioId}.mp3`;

      await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: audioContent,
        ContentType: 'audio/mp3',
      }).promise();

      // Clean up local file
      await promisify(fs.unlink)(audioPath);

      return s3Key;
    } catch (error) {
      console.error('Error in uploadAudio:', error);
      throw error;
    }
  },

  // Start transcription job
  startTranscription: async (s3Key, languageCode = 'en-US') => {
    try {
      const jobName = `transcription-${uuidv4()}`;
      const s3Uri = `s3://${process.env.AWS_S3_BUCKET}/${s3Key}`;

      const params = {
        TranscriptionJobName: jobName,
        LanguageCode: languageCode,
        Media: { MediaFileUri: s3Uri },
        MediaFormat: 'mp3',
        OutputBucketName: process.env.AWS_S3_BUCKET,
        Settings: {
          ShowSpeakerLabels: true,
          MaxSpeakerLabels: 2,
          VocabularyName: 'ExamTerms', // Custom vocabulary for exam-related terms
        },
      };

      await transcribe.startTranscriptionJob(params).promise();
      return jobName;
    } catch (error) {
      console.error('Error in startTranscription:', error);
      throw error;
    }
  },

  // Check transcription job status
  checkTranscriptionStatus: async (jobName) => {
    try {
      const { TranscriptionJob } = await transcribe
        .getTranscriptionJob({ TranscriptionJobName: jobName })
        .promise();

      return {
        status: TranscriptionJob.TranscriptionJobStatus,
        outputUri: TranscriptionJob.Transcript?.TranscriptFileUri,
      };
    } catch (error) {
      console.error('Error in checkTranscriptionStatus:', error);
      throw error;
    }
  },

  // Get transcription results
  getTranscriptionResults: async (outputUri) => {
    try {
      const response = await fetch(outputUri);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error in getTranscriptionResults:', error);
      throw error;
    }
  },

  // Translate transcription
  translateTranscription: async (text, targetLanguage) => {
    try {
      const params = {
        Text: text,
        SourceLanguageCode: 'en',
        TargetLanguageCode: targetLanguage,
      };

      const { TranslatedText } = await translate.translateText(params).promise();
      return TranslatedText;
    } catch (error) {
      console.error('Error in translateTranscription:', error);
      throw error;
    }
  },

  // Generate subtitles in VTT format
  generateSubtitles: async (transcriptionResults, language = 'en') => {
    try {
      let vtt = 'WEBVTT\n\n';
      let counter = 1;

      for (const item of transcriptionResults.items) {
        if (item.type === 'pronunciation') {
          const startTime = parseFloat(item.start_time);
          const endTime = parseFloat(item.end_time);

          const formatTime = (time) => {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = Math.floor(time % 60);
            const milliseconds = Math.floor((time % 1) * 1000);

            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
              2,
              '0'
            )}:${String(seconds).padStart(2, '0')}.${String(
              milliseconds
            ).padStart(3, '0')}`;
          };

          vtt += `${counter}\n`;
          vtt += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
          vtt += `${item.alternatives[0].content}\n\n`;

          counter++;
        }
      }

      // Save VTT file to S3
      const vttKey = `subtitles/${uuidv4()}_${language}.vtt`;
      await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: vttKey,
        Body: vtt,
        ContentType: 'text/vtt',
      }).promise();

      return {
        vttKey,
        vttUrl: `${process.env.CLOUDFRONT_URL}/${vttKey}`,
      };
    } catch (error) {
      console.error('Error in generateSubtitles:', error);
      throw error;
    }
  },

  // Process video for transcription
  processVideo: async (videoPath, languages = ['en']) => {
    try {
      // Extract audio
      const { audioPath, audioId } = await transcriptionService.extractAudio(
        videoPath
      );

      // Upload audio to S3
      const s3Key = await transcriptionService.uploadAudio(audioPath, audioId);

      // Start transcription
      const jobName = await transcriptionService.startTranscription(s3Key);

      // Poll for completion
      let status;
      do {
        const result = await transcriptionService.checkTranscriptionStatus(
          jobName
        );
        status = result.status;

        if (status === 'COMPLETED') {
          // Get transcription results
          const results = await transcriptionService.getTranscriptionResults(
            result.outputUri
          );

          // Generate subtitles for each language
          const subtitles = await Promise.all(
            languages.map(async (lang) => {
              if (lang === 'en') {
                return transcriptionService.generateSubtitles(results, lang);
              } else {
                // Translate and generate subtitles
                const translatedText = await transcriptionService.translateTranscription(
                  results.items
                    .map((item) => item.alternatives[0].content)
                    .join(' '),
                  lang
                );
                return transcriptionService.generateSubtitles(
                  {
                    items: results.items.map((item) => ({
                      ...item,
                      alternatives: [{ content: translatedText }],
                    })),
                  },
                  lang
                );
              }
            })
          );

          return {
            status: 'completed',
            subtitles,
            transcript: results,
          };
        } else if (status === 'FAILED') {
          throw new Error('Transcription job failed');
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } while (status === 'IN_PROGRESS');
    } catch (error) {
      console.error('Error in processVideo:', error);
      throw error;
    }
  },

  // Search through transcripts
  searchTranscripts: async (query, videoId) => {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `transcripts/${videoId}/`,
      };

      const objects = await s3.listObjectsV2(params).promise();
      const transcriptObjects = objects.Contents.filter((obj) =>
        obj.Key.endsWith('.json')
      );

      const searchResults = [];

      for (const obj of transcriptObjects) {
        const { Body } = await s3.getObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: obj.Key,
        }).promise();

        const transcript = JSON.parse(Body.toString());
        const matches = transcript.results.items.filter((item) =>
          item.alternatives[0].content
            .toLowerCase()
            .includes(query.toLowerCase())
        );

        if (matches.length > 0) {
          searchResults.push({
            videoId,
            matches: matches.map((match) => ({
              text: match.alternatives[0].content,
              startTime: parseFloat(match.start_time),
              endTime: parseFloat(match.end_time),
            })),
          });
        }
      }

      return searchResults;
    } catch (error) {
      console.error('Error in searchTranscripts:', error);
      throw error;
    }
  },
};

module.exports = transcriptionService;
