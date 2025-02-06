import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import {
  getCoachingCenterById,
  addStudent,
  createNotice,
  scheduleLiveClass,
} from '../../store/slices/coachingSlice';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const CoachingDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCenter, loading, error } = useSelector((state) => state.coaching);
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const [openLiveClassDialog, setOpenLiveClassDialog] = useState(false);
  const [studentData, setStudentData] = useState({
    email: '',
    fullName: '',
    phone: '',
  });
  const [noticeData, setNoticeData] = useState({
    title: '',
    content: '',
  });
  const [liveClassData, setLiveClassData] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: '',
    meetingLink: '',
  });

  useEffect(() => {
    dispatch(getCoachingCenterById(id));
  }, [dispatch, id]);

  const handleAddStudent = async () => {
    await dispatch(addStudent({ centerId: id, studentData }));
    setOpenAddStudentDialog(false);
    setStudentData({ email: '', fullName: '', phone: '' });
  };

  const handleCreateNotice = async () => {
    await dispatch(createNotice({ centerId: id, noticeData }));
    setOpenNoticeDialog(false);
    setNoticeData({ title: '', content: '' });
  };

  const handleScheduleLiveClass = async () => {
    await dispatch(scheduleLiveClass({ centerId: id, classData: liveClassData }));
    setOpenLiveClassDialog(false);
    setLiveClassData({
      title: '',
      description: '',
      startTime: '',
      duration: '',
      meetingLink: '',
    });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!currentCenter) {
    return (
      <Container>
        <Alert severity="error">Coaching center not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs>
              <Typography variant="h4" component="h1">
                {currentCenter.name}
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                {currentCenter.description}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<NotificationsIcon />}
                onClick={() => setOpenNoticeDialog(true)}
                sx={{ mr: 1 }}
              >
                Post Notice
              </Button>
              <Button
                variant="contained"
                startIcon={<VideoCallIcon />}
                onClick={() => setOpenLiveClassDialog(true)}
              >
                Schedule Class
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="h4">
                  {currentCenter.students?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Courses
                </Typography>
                <Typography variant="h4">
                  {currentCenter.courses?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Upcoming Classes
                </Typography>
                <Typography variant="h4">
                  {currentCenter.liveClasses?.filter(
                    (c) => new Date(c.startTime) > new Date()
                  ).length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper elevation={3}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Students" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Notices" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab label="Live Classes" icon={<VideoCallIcon />} iconPosition="start" />
            <Tab label="Courses" icon={<SchoolIcon />} iconPosition="start" />
          </Tabs>

          {/* Students Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddStudentDialog(true)}
              >
                Add Student
              </Button>
            </Box>
            <List>
              {currentCenter.students?.map((student) => (
                <ListItem key={student._id}>
                  <ListItemText
                    primary={student.fullName}
                    secondary={student.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Notices Tab */}
          <TabPanel value={tabValue} index={1}>
            {currentCenter.notices?.map((notice) => (
              <Paper key={notice._id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">{notice.title}</Typography>
                <Typography color="textSecondary" sx={{ mb: 1 }}>
                  {new Date(notice.createdAt).toLocaleDateString()}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>{notice.content}</Typography>
              </Paper>
            ))}
          </TabPanel>

          {/* Live Classes Tab */}
          <TabPanel value={tabValue} index={2}>
            {currentCenter.liveClasses?.map((liveClass) => (
              <Paper key={liveClass._id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">{liveClass.title}</Typography>
                <Typography color="textSecondary">
                  Start Time: {new Date(liveClass.startTime).toLocaleString()}
                </Typography>
                <Typography color="textSecondary">
                  Duration: {liveClass.duration} minutes
                </Typography>
                <Typography sx={{ mt: 1 }}>{liveClass.description}</Typography>
                <Button
                  variant="contained"
                  href={liveClass.meetingLink}
                  target="_blank"
                  sx={{ mt: 2 }}
                >
                  Join Class
                </Button>
              </Paper>
            ))}
          </TabPanel>

          {/* Courses Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="body1">Course management coming soon...</Typography>
          </TabPanel>
        </Paper>
      </Box>

      {/* Add Student Dialog */}
      <Dialog
        open={openAddStudentDialog}
        onClose={() => setOpenAddStudentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={studentData.fullName}
              onChange={(e) =>
                setStudentData({ ...studentData, fullName: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={studentData.email}
              onChange={(e) =>
                setStudentData({ ...studentData, email: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={studentData.phone}
              onChange={(e) =>
                setStudentData({ ...studentData, phone: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddStudentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained">
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Notice Dialog */}
      <Dialog
        open={openNoticeDialog}
        onClose={() => setOpenNoticeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Notice</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={noticeData.title}
              onChange={(e) =>
                setNoticeData({ ...noticeData, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              value={noticeData.content}
              onChange={(e) =>
                setNoticeData({ ...noticeData, content: e.target.value })
              }
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoticeDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateNotice} variant="contained">
            Post Notice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Live Class Dialog */}
      <Dialog
        open={openLiveClassDialog}
        onClose={() => setOpenLiveClassDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Live Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={liveClassData.title}
              onChange={(e) =>
                setLiveClassData({ ...liveClassData, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={liveClassData.description}
              onChange={(e) =>
                setLiveClassData({
                  ...liveClassData,
                  description: e.target.value,
                })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={liveClassData.startTime}
              onChange={(e) =>
                setLiveClassData({
                  ...liveClassData,
                  startTime: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={liveClassData.duration}
              onChange={(e) =>
                setLiveClassData({
                  ...liveClassData,
                  duration: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Meeting Link"
              value={liveClassData.meetingLink}
              onChange={(e) =>
                setLiveClassData({
                  ...liveClassData,
                  meetingLink: e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLiveClassDialog(false)}>Cancel</Button>
          <Button onClick={handleScheduleLiveClass} variant="contained">
            Schedule Class
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CoachingDetails;
