const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join course room
    socket.on('join-course', (courseId) => {
      socket.join(`course:${courseId}`);
      console.log(`User ${socket.user.id} joined course ${courseId}`);
    });

    // Leave course room
    socket.on('leave-course', (courseId) => {
      socket.leave(`course:${courseId}`);
      console.log(`User ${socket.user.id} left course ${courseId}`);
    });

    // Join live class room
    socket.on('join-live-class', (liveClassId) => {
      socket.join(`live-class:${liveClassId}`);
      io.to(`live-class:${liveClassId}`).emit('user-joined', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    // Leave live class room
    socket.on('leave-live-class', (liveClassId) => {
      socket.leave(`live-class:${liveClassId}`);
      io.to(`live-class:${liveClassId}`).emit('user-left', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    // Handle chat message
    socket.on('send-message', ({ liveClassId, message }) => {
      io.to(`live-class:${liveClassId}`).emit('new-message', {
        userId: socket.user.id,
        username: socket.user.username,
        message,
        timestamp: new Date(),
      });
    });

    // Handle raise hand
    socket.on('raise-hand', (liveClassId) => {
      io.to(`live-class:${liveClassId}`).emit('student-raised-hand', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    // Handle instructor actions
    socket.on('toggle-student-audio', ({ liveClassId, studentId, enabled }) => {
      io.to(`live-class:${liveClassId}`).emit('student-audio-toggle', {
        studentId,
        enabled,
      });
    });

    socket.on('toggle-student-video', ({ liveClassId, studentId, enabled }) => {
      io.to(`live-class:${liveClassId}`).emit('student-video-toggle', {
        studentId,
        enabled,
      });
    });

    // Handle screen sharing
    socket.on('start-screen-share', (liveClassId) => {
      io.to(`live-class:${liveClassId}`).emit('screen-share-started', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    socket.on('stop-screen-share', (liveClassId) => {
      io.to(`live-class:${liveClassId}`).emit('screen-share-stopped', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    // Handle polls
    socket.on('create-poll', ({ liveClassId, question, options }) => {
      io.to(`live-class:${liveClassId}`).emit('new-poll', {
        id: Date.now(),
        question,
        options,
        createdBy: socket.user.id,
      });
    });

    socket.on('submit-poll-answer', ({ liveClassId, pollId, answer }) => {
      io.to(`live-class:${liveClassId}`).emit('poll-answer-submitted', {
        pollId,
        userId: socket.user.id,
        answer,
      });
    });

    // Handle class recording status
    socket.on('toggle-recording', ({ liveClassId, isRecording }) => {
      io.to(`live-class:${liveClassId}`).emit('recording-status-changed', {
        isRecording,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

// Utility functions for emitting events
const socketService = {
  // Notify course updates
  notifyCourseUpdate: (courseId, update) => {
    if (!io) return;
    io.to(`course:${courseId}`).emit('course-updated', update);
  },

  // Notify new live class
  notifyNewLiveClass: (courseId, liveClass) => {
    if (!io) return;
    io.to(`course:${courseId}`).emit('new-live-class', liveClass);
  },

  // Notify live class started
  notifyLiveClassStarted: (liveClassId) => {
    if (!io) return;
    io.to(`live-class:${liveClassId}`).emit('class-started');
  },

  // Notify live class ended
  notifyLiveClassEnded: (liveClassId) => {
    if (!io) return;
    io.to(`live-class:${liveClassId}`).emit('class-ended');
  },

  // Broadcast announcement to live class
  sendAnnouncement: (liveClassId, announcement) => {
    if (!io) return;
    io.to(`live-class:${liveClassId}`).emit('announcement', announcement);
  },

  // Update participant list
  updateParticipantList: (liveClassId, participants) => {
    if (!io) return;
    io.to(`live-class:${liveClassId}`).emit('participants-updated', participants);
  },

  // Send error notification
  notifyError: (liveClassId, error) => {
    if (!io) return;
    io.to(`live-class:${liveClassId}`).emit('error', error);
  },
};

module.exports = {
  initializeSocket,
  socketService,
};
