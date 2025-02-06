import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import {
  getCourseById,
  addModule,
  updateModule,
  deleteModule,
  enrollStudent,
  clearError,
  clearSuccess,
} from '../../store/slices/courseSlice';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const CourseDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentCourse, loading, error, success } = useSelector(
    (state) => state.course
  );
  const { user } = useSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    content: '',
    duration: '',
    resources: '',
  });

  useEffect(() => {
    dispatch(getCourseById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      setOpenModuleDialog(false);
      setOpenDeleteDialog(false);
      setModuleData({
        title: '',
        description: '',
        content: '',
        duration: '',
        resources: '',
      });
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  const handleAddModule = () => {
    dispatch(addModule({ courseId: id, moduleData }));
  };

  const handleUpdateModule = () => {
    if (selectedModule) {
      dispatch(
        updateModule({
          courseId: id,
          moduleId: selectedModule._id,
          moduleData,
        })
      );
    }
  };

  const handleDeleteModule = () => {
    if (selectedModule) {
      dispatch(deleteModule({ courseId: id, moduleId: selectedModule._id }));
    }
  };

  const handleEnroll = () => {
    dispatch(enrollStudent({ courseId: id, studentId: user._id }));
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!currentCourse) {
    return (
      <Container>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        {/* Course Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {currentCourse.title}
              </Typography>
              <Typography color="textSecondary" paragraph>
                {currentCourse.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon sx={{ mr: 1 }} />
                  <Typography>{currentCourse.category}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon sx={{ mr: 1 }} />
                  <Typography>{currentCourse.duration}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography>
                    {currentCourse.students?.length || 0} Students
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="primary" gutterBottom>
                    <MoneyIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    ৳{currentCourse.price}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleEnroll}
                    disabled={currentCourse.students?.includes(user._id)}
                  >
                    {currentCourse.students?.includes(user._id)
                      ? 'Already Enrolled'
                      : 'Enroll Now'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Course Content */}
        <Paper elevation={3}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Modules" />
            <Tab label="Resources" />
            <Tab label="Discussion" />
          </Tabs>

          {/* Modules Tab */}
          <TabPanel value={tabValue} index={0}>
            {user.role === 'admin' && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedModule(null);
                    setOpenModuleDialog(true);
                  }}
                >
                  Add Module
                </Button>
              </Box>
            )}

            {currentCourse.modules?.map((module, index) => (
              <Accordion key={module._id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>
                    Module {index + 1}: {module.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Duration: {module.duration}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>{module.description}</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PlayIcon />
                      </ListItemIcon>
                      <ListItemText primary="Video Content" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="Reading Materials" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText primary="Assignments" />
                    </ListItem>
                  </List>
                  {user.role === 'admin' && (
                    <Box sx={{ mt: 2 }}>
                      <IconButton
                        onClick={() => {
                          setSelectedModule(module);
                          setModuleData(module);
                          setOpenModuleDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedModule(module);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          {/* Resources Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1">Resources coming soon...</Typography>
          </TabPanel>

          {/* Discussion Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="body1">Discussion forum coming soon...</Typography>
          </TabPanel>
        </Paper>
      </Box>

      {/* Add/Edit Module Dialog */}
      <Dialog
        open={openModuleDialog}
        onClose={() => setOpenModuleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedModule ? 'Edit Module' : 'Add New Module'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={moduleData.title}
              onChange={(e) =>
                setModuleData({ ...moduleData, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={moduleData.description}
              onChange={(e) =>
                setModuleData({ ...moduleData, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              value={moduleData.content}
              onChange={(e) =>
                setModuleData({ ...moduleData, content: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Duration"
              value={moduleData.duration}
              onChange={(e) =>
                setModuleData({ ...moduleData, duration: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Resources"
              value={moduleData.resources}
              onChange={(e) =>
                setModuleData({ ...moduleData, resources: e.target.value })
              }
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModuleDialog(false)}>Cancel</Button>
          <Button
            onClick={selectedModule ? handleUpdateModule : handleAddModule}
            variant="contained"
          >
            {selectedModule ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Module Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Module</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedModule?.title}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteModule}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetails;
