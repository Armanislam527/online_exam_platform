import React, { useState, useEffect } from "react";
import {
	Container,
	Grid,
	Card,
	CardContent,
	Typography,
	Button,
	TextField,
	Box,
	MenuItem,
	CircularProgress,
	Alert,
} from "@mui/material";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ExamList = () => {
	const [exams, setExams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");

	useEffect(() => {
		fetchExams();
	}, []);

	const fetchExams = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch(`${API_URL}/exams`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch exams");
			}

			const data = await response.json();
			setExams(data);
		} catch (error) {
			console.error("Error fetching exams:", error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const filteredExams = exams.filter((exam) => {
		const matchesSearch = exam.title
			.toLowerCase()
			.includes(search.toLowerCase());
		const matchesFilter =
			filter === "all" ||
			(filter === "upcoming" && new Date(exam.startTime) > new Date()) ||
			(filter === "completed" && new Date(exam.endTime) < new Date());
		return matchesSearch && matchesFilter;
	});

	if (loading) {
		return (
			<Container
				sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
				<CircularProgress />
			</Container>
		);
	}

	if (error) {
		return (
			<Container sx={{ mt: 4 }}>
				<Alert severity="error">{error}</Alert>
			</Container>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					mb: 3,
				}}>
				<Typography variant="h4" component="h1">
					Available Exams
				</Typography>
				<Box sx={{ display: "flex", gap: 2 }}>
					<TextField
						select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						size="small"
						sx={{ width: 150 }}>
						<MenuItem value="all">All Exams</MenuItem>
						<MenuItem value="upcoming">Upcoming</MenuItem>
						<MenuItem value="completed">Completed</MenuItem>
					</TextField>
					<TextField
						placeholder="Search exams..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						size="small"
						sx={{ width: 200 }}
					/>
				</Box>
			</Box>

			<Grid container spacing={3}>
				{filteredExams.length === 0 ? (
					<Grid item xs={12}>
						<Alert severity="info">
							No exams found matching your criteria.
						</Alert>
					</Grid>
				) : (
					filteredExams.map((exam) => (
						<Grid item xs={12} md={6} lg={4} key={exam._id}>
							<Card>
								<CardContent>
									<Typography variant="h6" gutterBottom>
										{exam.title}
									</Typography>
									<Typography
										color="textSecondary"
										gutterBottom>
										Duration: {exam.duration} minutes
									</Typography>
									<Typography
										color="textSecondary"
										gutterBottom>
										Total Marks: {exam.totalMarks}
									</Typography>
									<Box sx={{ mt: 2 }}>
										<Button
											component={Link}
											to={`/exam/${exam._id}`}
											variant="contained"
											color="primary"
											fullWidth>
											View Details
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

export default ExamList;
