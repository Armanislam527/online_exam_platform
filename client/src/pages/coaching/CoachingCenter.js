import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Rating,
} from '@mui/material';
import { Link } from 'react-router-dom';

const CoachingCenter = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCoachingCenters();
  }, []);

  const fetchCoachingCenters = async () => {
    try {
      const response = await fetch('/api/v1/coaching-centers');
      const data = await response.json();
      setCenters(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coaching centers:', error);
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter((center) =>
    center.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Coaching Centers
        </Typography>
        <TextField
          placeholder="Search coaching centers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 250 }}
        />
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          filteredCenters.map((center) => (
            <Grid item xs={12} md={6} lg={4} key={center._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {center.name}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Rating value={center.rating} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary">
                      ({center.reviewCount} reviews)
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" paragraph>
                    {center.description}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Location:</strong> {center.location}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Subjects:</strong>{' '}
                    {center.subjects.join(', ')}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      component={Link}
                      to={`/coaching/${center._id}`}
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      View Details
                    </Button>
                    <Button
                      component={Link}
                      to={`/coaching/${center._id}/courses`}
                      variant="outlined"
                      color="primary"
                      fullWidth
                    >
                      View Courses
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default CoachingCenter;
