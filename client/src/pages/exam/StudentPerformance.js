import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const StudentPerformance = () => {
  const { userId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For now, we'll simulate it with mock data
    const mockData = {
      student: {
        name: user.profile?.fullName || user.username,
        totalExams: 15,
        averageScore: 75.5,
        examHistory: [
          { date: '2025-01-01', score: 85, examName: 'Mathematics Test 1' },
          { date: '2025-01-15', score: 78, examName: 'Physics Quiz' },
          { date: '2025-02-01', score: 92, examName: 'Chemistry Final' },
          // Add more exam history
        ],
        categoryPerformance: [
          { category: 'Mathematics', score: 85 },
          { category: 'Physics', score: 78 },
          { category: 'Chemistry', score: 92 },
          { category: 'Biology', score: 88 },
          { category: 'Computer Science', score: 95 },
        ],
        strengthsAndWeaknesses: [
          { area: 'Problem Solving', score: 90 },
          { area: 'Theoretical Knowledge', score: 85 },
          { area: 'Numerical Ability', score: 88 },
          { area: 'Analytical Skills', score: 92 },
          { area: 'Conceptual Understanding', score: 86 },
        ],
      },
    };

    setTimeout(() => {
      setPerformanceData(mockData);
      setLoading(false);
    }, 1000);
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!performanceData) {
    return (
      <Container>
        <Alert severity="error">Failed to load performance data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Performance Analysis - {performanceData.student.name}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Exams Taken
                  </Typography>
                  <Typography variant="h4">
                    {performanceData.student.totalExams}
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
                    {performanceData.student.averageScore}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Performance Trend
                  </Typography>
                  <Typography variant="h4" color={
                    performanceData.student.examHistory[performanceData.student.examHistory.length - 1].score >
                    performanceData.student.examHistory[0].score
                      ? 'success.main'
                      : 'error.main'
                  }>
                    {performanceData.student.examHistory[performanceData.student.examHistory.length - 1].score >
                    performanceData.student.examHistory[0].score
                      ? '↑'
                      : '↓'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Progress Over Time */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Progress Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData.student.examHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Category Performance */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  data={performanceData.student.categoryPerformance}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Strengths and Weaknesses
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  data={performanceData.student.strengthsAndWeaknesses}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="area" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Exam History */}
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Exam History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Exam Name</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell>Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceData.student.examHistory.map((exam) => (
                  <TableRow key={exam.date}>
                    <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.examName}</TableCell>
                    <TableCell align="right">{exam.score}%</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={exam.score}
                          sx={{
                            width: '100%',
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                exam.score >= 90
                                  ? '#4caf50'
                                  : exam.score >= 70
                                  ? '#2196f3'
                                  : exam.score >= 50
                                  ? '#ff9800'
                                  : '#f44336',
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentPerformance;
