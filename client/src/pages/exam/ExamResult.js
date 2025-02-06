import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getExamById } from '../../store/slices/examSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const ExamResult = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentExam, loading, error } = useSelector((state) => state.exam);
  const [tabValue, setTabValue] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    dispatch(getExamById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentExam) {
      generateAnalytics();
    }
  }, [currentExam]);

  const generateAnalytics = () => {
    if (!currentExam) return;

    // Calculate score distribution
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    currentExam.participants.forEach((participant) => {
      const percentage = (participant.score / currentExam.totalMarks) * 100;
      if (percentage <= 20) scoreRanges['0-20']++;
      else if (percentage <= 40) scoreRanges['21-40']++;
      else if (percentage <= 60) scoreRanges['41-60']++;
      else if (percentage <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    // Calculate category-wise performance
    const categoryPerformance = {};
    currentExam.questions.forEach((question, index) => {
      if (!categoryPerformance[question.category]) {
        categoryPerformance[question.category] = {
          totalQuestions: 0,
          correctAnswers: 0,
          totalMarks: 0,
          obtainedMarks: 0,
        };
      }

      categoryPerformance[question.category].totalQuestions++;
      categoryPerformance[question.category].totalMarks += question.marks;

      currentExam.participants.forEach((participant) => {
        const answer = participant.answers.find(
          (a) => a.questionId.toString() === index.toString()
        );
        if (answer && answer.isCorrect) {
          categoryPerformance[question.category].correctAnswers++;
          categoryPerformance[question.category].obtainedMarks += question.marks;
        }
      });
    });

    setAnalyticsData({
      scoreDistribution: Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count,
      })),
      categoryPerformance: Object.entries(categoryPerformance).map(
        ([category, data]) => ({
          category,
          accuracy: (data.correctAnswers / (data.totalQuestions * currentExam.participants.length)) * 100,
          averageScore: (data.obtainedMarks / (data.totalMarks * currentExam.participants.length)) * 100,
        })
      ),
    });
  };

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

  if (!currentExam || !analyticsData) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {currentExam.title} - Results
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Participants
                  </Typography>
                  <Typography variant="h4">
                    {currentExam.participants.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant="h4">
                    {(
                      currentExam.participants.reduce(
                        (acc, p) => acc + p.score,
                        0
                      ) / currentExam.participants.length
                    ).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pass Rate
                  </Typography>
                  <Typography variant="h4">
                    {(
                      (currentExam.participants.filter(
                        (p) => p.score >= currentExam.passingMarks
                      ).length /
                        currentExam.participants.length) *
                      100
                    ).toFixed(1)}
                    %
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" />
            <Tab label="Score Distribution" />
            <Tab label="Category Analysis" />
            <Tab label="Participant List" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Score Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Category Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryPerformance}
                      dataKey="accuracy"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analyticsData.categoryPerformance.map((entry, index) => (
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

          {/* Score Distribution Tab */}
          <TabPanel value={tabValue} index={1}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>

          {/* Category Analysis Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Accuracy (%)</TableCell>
                    <TableCell align="right">Average Score (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.categoryPerformance.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell>{category.category}</TableCell>
                      <TableCell align="right">
                        {category.accuracy.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {category.averageScore.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Participant List Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="right">Submission Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentExam.participants
                    .sort((a, b) => b.score - a.score)
                    .map((participant, index) => (
                      <TableRow key={participant.user._id}>
                        <TableCell>
                          {participant.user.profile?.fullName ||
                            participant.user.username}
                        </TableCell>
                        <TableCell align="right">
                          {participant.score} / {currentExam.totalMarks}
                        </TableCell>
                        <TableCell align="right">
                          {((participant.score / currentExam.totalMarks) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          {new Date(participant.submittedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamResult;
