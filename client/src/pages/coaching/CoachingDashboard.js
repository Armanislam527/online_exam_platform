import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getCoachingCenters,
  createCoachingCenter,
  createNotice,
  scheduleLiveClass,
} from '../../store/slices/coachingSlice';

const CoachingDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { centers, loading, error } = useSelector((state) => state.coaching);
  const { user } = useSelector((state) => state.auth);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const [openLiveClassDialog, setOpenLiveClassDialog] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
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
    dispatch(getCoachingCenters());
  }, [dispatch]);

  const handleCreateCenter = async () => {
    await dispatch(createCoachingCenter(formData));
    setOpenCreateDialog(false);
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
    });
  };

  const handleCreateNotice = async () => {
    if (selectedCenter) {
      await dispatch(
        createNotice({
          centerId: selectedCenter._id,
          noticeData,
        })
      );
      setOpenNoticeDialog(false);
      setNoticeData({ title: '', content: '' });
    }
  };

  const handleScheduleLiveClass = async () => {
    if (selectedCenter) {
      await dispatch(
        scheduleLiveClass({
          centerId: selectedCenter._id,
          classData: liveClassData,
        })
      );
      setOpenLiveClassDialog(false);
      setLiveClassData({
        title: '',
        description: '',
        startTime: '',
        duration: '',
        meetingLink: '',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs>
            <Typography variant="h4" component="h1">
              Coaching Centers
            </Typography>
          </Grid>
          {user.role === 'admin' && (
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create New Center
              </Button>
            </Grid>
          )}
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {centers.map((center) => (
            <Grid item xs={12} md={6} lg={4} key={center._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {center.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {center.description}
                  </Typography>
                  <Typography variant="body2">
                    Students: {center.students?.length || 0}
                  </Typography>
                  <Typography variant="body2">
                    Courses: {center.courses?.length || 0}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/coaching/${center._id}`)}
                  >
                    View Details
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedCenter(center);
                      setOpenNoticeDialog(true);
                    }}
                  >
                    <NotificationsIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedCenter(center);
                      setOpenLiveClassDialog(true);
                    }}
                  >
                    <VideoCallIcon />
                  </IconButton>
                  {user.role === 'admin' && (
                    <>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Create Center Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Coaching Center</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCenter} variant="contained">
            Create
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

export default CoachingDashboard;
