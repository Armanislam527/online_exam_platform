import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  PanTool as RaiseHandIcon,
  Poll as PollIcon,
  FiberManualRecord as RecordIcon,
  People as PeopleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import io from 'socket.io-client';

const LiveClass = () => {
  const { liveClassId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
  });
  const [currentPoll, setCurrentPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const videoRef = useRef();
  const screenShareRef = useRef();
  const chatContainerRef = useRef();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_API_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join-live-class', liveClassId);
      setLoading(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to the live class');
      setLoading(false);
    });

    setSocket(newSocket);

    // Clean up socket connection
    return () => {
      if (newSocket) {
        newSocket.emit('leave-live-class', liveClassId);
        newSocket.disconnect();
      }
    };
  }, [liveClassId]);

  useEffect(() => {
    if (!socket) return;

    // Handle participant updates
    socket.on('user-joined', (user) => {
      setParticipants((prev) => [...prev, user]);
    });

    socket.on('user-left', (user) => {
      setParticipants((prev) =>
        prev.filter((p) => p.userId !== user.userId)
      );
    });

    // Handle chat messages
    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });

    // Handle polls
    socket.on('new-poll', (poll) => {
      setCurrentPoll(poll);
    });

    socket.on('poll-answer-submitted', (answer) => {
      setCurrentPoll((prev) => {
        if (!prev || prev.id !== answer.pollId) return prev;
        return {
          ...prev,
          answers: [...(prev.answers || []), answer],
        };
      });
    });

    // Handle media controls
    socket.on('student-audio-toggle', ({ studentId, enabled }) => {
      if (studentId === user.id) {
        setIsAudioEnabled(enabled);
      }
    });

    socket.on('student-video-toggle', ({ studentId, enabled }) => {
      if (studentId === user.id) {
        setIsVideoEnabled(enabled);
      }
    });

    // Handle screen sharing
    socket.on('screen-share-started', ({ userId }) => {
      if (userId !== user.id) {
        // Handle viewing other's screen share
      }
    });

    socket.on('screen-share-stopped', () => {
      // Handle screen share stop
    });

    // Handle recording status
    socket.on('recording-status-changed', ({ isRecording }) => {
      setIsRecording(isRecording);
    });

    // Handle errors
    socket.on('error', (error) => {
      setError(error.message);
    });
  }, [socket, user.id]);

  // Initialize WebRTC
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Failed to access camera and microphone');
      }
    };

    initializeMedia();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => !prev);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isAudioEnabled));
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenShareRef.current.srcObject = stream;
        setIsScreenSharing(true);
        socket.emit('start-screen-share', liveClassId);

        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
      setError('Failed to share screen');
    }
  };

  const stopScreenShare = () => {
    if (screenShareRef.current?.srcObject) {
      screenShareRef.current.srcObject.getTracks().forEach((track) => track.stop());
      screenShareRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
    socket.emit('stop-screen-share', liveClassId);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit('send-message', {
      liveClassId,
      message: newMessage.trim(),
    });
    setNewMessage('');
  };

  const raiseHand = () => {
    socket.emit('raise-hand', liveClassId);
  };

  const createPoll = () => {
    socket.emit('create-poll', {
      liveClassId,
      question: pollData.question,
      options: pollData.options.filter((opt) => opt.trim()),
    });
    setShowPollDialog(false);
    setPollData({ question: '', options: ['', ''] });
  };

  const submitPollAnswer = (answer) => {
    socket.emit('submit-poll-answer', {
      liveClassId,
      pollId: currentPoll.id,
      answer,
    });
  };

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    socket.emit('toggle-recording', {
      liveClassId,
      isRecording: !isRecording,
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Main Video Area */}
        <Grid item xs={12} md={9}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flex: 1, position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                muted={!isAudioEnabled}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {isScreenSharing && (
                <video
                  ref={screenShareRef}
                  autoPlay
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>

            {/* Control Bar */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <IconButton onClick={toggleAudio}>
                {isAudioEnabled ? <MicIcon /> : <MicOffIcon color="error" />}
              </IconButton>
              <IconButton onClick={toggleVideo}>
                {isVideoEnabled ? (
                  <VideocamIcon />
                ) : (
                  <VideocamOffIcon color="error" />
                )}
              </IconButton>
              <IconButton onClick={toggleScreenShare}>
                {isScreenSharing ? (
                  <StopScreenShareIcon color="error" />
                ) : (
                  <ScreenShareIcon />
                )}
              </IconButton>
              <IconButton onClick={() => setShowChat((prev) => !prev)}>
                <Badge badgeContent={messages.length} color="primary">
                  <ChatIcon />
                </Badge>
              </IconButton>
              <IconButton onClick={raiseHand}>
                <RaiseHandIcon />
              </IconButton>
              {user.role === 'instructor' && (
                <>
                  <IconButton onClick={() => setShowPollDialog(true)}>
                    <PollIcon />
                  </IconButton>
                  <IconButton onClick={toggleRecording}>
                    <RecordIcon color={isRecording ? 'error' : 'inherit'} />
                  </IconButton>
                </>
              )}
              <IconButton
                onClick={() => setShowParticipants((prev) => !prev)}
              >
                <Badge badgeContent={participants.length} color="primary">
                  <PeopleIcon />
                </Badge>
              </IconButton>
            </Paper>
          </Paper>
        </Grid>

        {/* Side Panel */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            display: {
              xs: showChat || showParticipants ? 'block' : 'none',
              md: 'block',
            },
          }}
        >
          <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            {showChat && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">Chat</Typography>
                </Box>
                <Box
                  ref={chatContainerRef}
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                  }}
                >
                  {messages.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems:
                          msg.userId === user.id ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        {msg.username}
                      </Typography>
                      <Paper
                        sx={{
                          p: 1,
                          bgcolor:
                            msg.userId === user.id ? 'primary.main' : 'grey.100',
                          color:
                            msg.userId === user.id ? 'primary.contrastText' : 'inherit',
                        }}
                      >
                        <Typography variant="body2">{msg.message}</Typography>
                      </Paper>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={1}>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage();
                          }
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <IconButton onClick={sendMessage} color="primary">
                        <SendIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}

            {showParticipants && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">Participants ({participants.length})</Typography>
                </Box>
                <List sx={{ flex: 1, overflow: 'auto' }}>
                  {participants.map((participant) => (
                    <ListItem
                      key={participant.userId}
                      secondaryAction={
                        user.role === 'instructor' && (
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                socket.emit('toggle-student-audio', {
                                  liveClassId,
                                  studentId: participant.userId,
                                  enabled: !participant.isAudioEnabled,
                                })
                              }
                            >
                              {participant.isAudioEnabled ? (
                                <MicIcon fontSize="small" />
                              ) : (
                                <MicOffIcon fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                socket.emit('toggle-student-video', {
                                  liveClassId,
                                  studentId: participant.userId,
                                  enabled: !participant.isVideoEnabled,
                                })
                              }
                            >
                              {participant.isVideoEnabled ? (
                                <VideocamIcon fontSize="small" />
                              ) : (
                                <VideocamOffIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>{participant.username[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.username}
                        secondary={participant.role}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Poll Dialog */}
      <Dialog
        open={showPollDialog}
        onClose={() => setShowPollDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Poll</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question"
            value={pollData.question}
            onChange={(e) =>
              setPollData({ ...pollData, question: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
          />
          {pollData.options.map((option, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Option ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...pollData.options];
                newOptions[index] = e.target.value;
                setPollData({ ...pollData, options: newOptions });
              }}
              sx={{ mb: 1 }}
            />
          ))}
          <Button
            onClick={() =>
              setPollData({
                ...pollData,
                options: [...pollData.options, ''],
              })
            }
          >
            Add Option
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPollDialog(false)}>Cancel</Button>
          <Button onClick={createPoll} variant="contained">
            Create Poll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Current Poll Dialog */}
      <Dialog
        open={Boolean(currentPoll)}
        onClose={() => setCurrentPoll(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{currentPoll?.question}</DialogTitle>
        <DialogContent>
          <List>
            {currentPoll?.options.map((option, index) => (
              <ListItem key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => submitPollAnswer(option)}
                >
                  {option}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default LiveClass;
