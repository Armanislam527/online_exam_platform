import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as ExamIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Notifications as NotificationIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAdminStats } from '../../store/slices/adminSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    dispatch(getAdminStats({ timeRange }));
  }, [dispatch, timeRange]);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Total Users</Typography>
              </Box>
              <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.newUsers || 0} new this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Active Courses</Typography>
              </Box>
              <Typography variant="h4">{stats?.activeCourses || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.totalEnrollments || 0} total enrollments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ExamIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Total Exams</Typography>
              </Box>
              <Typography variant="h4">{stats?.totalExams || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.examsTaken || 0} taken this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h4">৳{stats?.totalRevenue || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                ৳{stats?.revenueThisWeek || 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Revenue Overview</Typography>
              <Box>
                <Button
                  size="small"
                  variant={timeRange === 'week' ? 'contained' : 'outlined'}
                  onClick={() => setTimeRange('week')}
                  sx={{ mr: 1 }}
                >
                  Week
                </Button>
                <Button
                  size="small"
                  variant={timeRange === 'month' ? 'contained' : 'outlined'}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </Button>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            <List>
              {stats?.recentActivities?.map((activity, index) => (
                <ListItem key={index} divider={index !== stats.recentActivities.length - 1}>
                  <ListItemText
                    primary={activity.description}
                    secondary={new Date(activity.timestamp).toLocaleString()}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={activity.type}
                      color={
                        activity.type === 'payment'
                          ? 'success'
                          : activity.type === 'exam'
                          ? 'primary'
                          : 'default'
                      }
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.userDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {stats?.userDistribution?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upcoming Events
            </Typography>
            <List>
              {stats?.upcomingEvents?.map((event, index) => (
                <ListItem key={index} divider={index !== stats.upcomingEvents.length - 1}>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <>
                        <EventIcon
                          fontSize="small"
                          sx={{ verticalAlign: 'middle', mr: 1 }}
                        />
                        {new Date(event.startTime).toLocaleString()}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Full Width Sections */}
        <Grid item xs={12}>
          <Paper sx={{ mt: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Recent Payments" />
              <Tab label="Active Users" />
              <Tab label="Course Analytics" />
            </Tabs>

            {/* Recent Payments Tab */}
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.recentPayments?.map((payment) => (
                      <TableRow key={payment.transactionId}>
                        <TableCell>{payment.transactionId}</TableCell>
                        <TableCell>{payment.user}</TableCell>
                        <TableCell>{payment.purpose}</TableCell>
                        <TableCell>৳{payment.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={
                              payment.status === 'completed'
                                ? 'success'
                                : payment.status === 'pending'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(payment.date).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Active Users Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    User Activity
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.userActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Online Users
                  </Typography>
                  <List>
                    {stats?.onlineUsers?.map((user) => (
                      <ListItem key={user.id}>
                        <ListItemText
                          primary={user.name}
                          secondary={user.activity}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label="Online"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Course Analytics Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Popular Courses
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.popularCourses || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Course Completion Rates
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats?.courseCompletion || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {stats?.courseCompletion?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
