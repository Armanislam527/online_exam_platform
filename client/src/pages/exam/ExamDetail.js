import React, { useState, useEffect } from "react";
import {
	Container,
	Paper,
	Typography,
	Button,
	Box,
	Grid,
	Divider,
	List,
	ListItem,
	ListItemText,
	CircularProgress,
	Alert,
	Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../services/axiosConfig";

const ExamDetail = () => {
	const { examId } = useParams();
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [exam, setExam] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchExamDetails = async () => {
		try {
			const response = await axiosInstance.get(`/exams/${examId}`);
			setExam(response.data);
			setError("");
		} catch (error) {
			setError(
				error.response?.data?.message || "Failed to load exam details"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (examId) {
			fetchExamDetails();
		}
	}, [examId]);

	const handleStartExam = () => {
		navigate(`/exam/${examId}/take`);
	};

	const handleEditExam = () => {
		navigate(`/exam/${examId}/edit`);
	};

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="80vh">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="lg" sx={{ mt: 4 }}>
				<Alert severity="error">{error}</Alert>
			</Container>
		);
	}

	if (!exam) {
		return (
			<Container maxWidth="lg" sx={{ mt: 4 }}>
				<Alert severity="info">Exam not found</Alert>
			</Container>
		);
	}

	const isExaminer = currentUser?.role === "examiner";
	const isStudent = currentUser?.role === "student";
	const canTakeExam = isStudent && !exam.hasParticipated;
	const examStarted = new Date(exam.startTime) <= new Date();
	const examEnded = new Date(exam.endTime) <= new Date();

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<Paper sx={{ p: 4 }}>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center">
							<Typography variant="h4" gutterBottom>
								{exam.title}
							</Typography>
							<Box>
								{isExaminer && (
									<Button
										variant="outlined"
										onClick={handleEditExam}
										sx={{ mr: 2 }}>
										Edit Exam
									</Button>
								)}
								{canTakeExam && examStarted && !examEnded && (
									<Button
										variant="contained"
										color="primary"
										onClick={handleStartExam}>
										Start Exam
									</Button>
								)}
							</Box>
						</Box>
					</Grid>

					<Grid item xs={12}>
						<Typography variant="body1" paragraph>
							{exam.description}
						</Typography>
					</Grid>

					<Grid item xs={12}>
						<Divider sx={{ my: 2 }} />
						<Typography variant="h6" gutterBottom>
							Exam Details
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6} md={4}>
								<Box>
									<Typography color="textSecondary">
										Duration
									</Typography>
									<Typography variant="h6">
										{exam.duration} minutes
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<Box>
									<Typography color="textSecondary">
										Total Marks
									</Typography>
									<Typography variant="h6">
										{exam.totalMarks}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<Box>
									<Typography color="textSecondary">
										Passing Marks
									</Typography>
									<Typography variant="h6">
										{exam.passingMarks}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<Box>
									<Typography color="textSecondary">
										Start Time
									</Typography>
									<Typography variant="h6">
										{new Date(
											exam.startTime
										).toLocaleString()}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<Box>
									<Typography color="textSecondary">
										End Time
									</Typography>
									<Typography variant="h6">
										{new Date(
											exam.endTime
										).toLocaleString()}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<Box>
									<Typography color="textSecondary">
										Status
									</Typography>
									<Chip
										label={
											examEnded
												? "Ended"
												: examStarted
												? "In Progress"
												: "Upcoming"
										}
										color={
											examEnded
												? "default"
												: examStarted
												? "success"
												: "primary"
										}
									/>
								</Box>
							</Grid>
						</Grid>
					</Grid>

					{exam.instructions && (
						<Grid item xs={12}>
							<Divider sx={{ my: 2 }} />
							<Typography variant="h6" gutterBottom>
								Instructions
							</Typography>
							<Typography variant="body1" paragraph>
								{exam.instructions}
							</Typography>
						</Grid>
					)}

					{isExaminer && (
						<Grid item xs={12}>
							<Divider sx={{ my: 2 }} />
							<Typography variant="h6" gutterBottom>
								Statistics
							</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6} md={4}>
									<Box>
										<Typography color="textSecondary">
											Total Participants
										</Typography>
										<Typography variant="h6">
											{exam.totalParticipants}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={4}>
									<Box>
										<Typography color="textSecondary">
											Average Score
										</Typography>
										<Typography variant="h6">
											{exam.averageScore?.toFixed(2) ||
												"N/A"}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={4}>
									<Box>
										<Typography color="textSecondary">
											Pass Rate
										</Typography>
										<Typography variant="h6">
											{exam.passRate
												? `${(
														exam.passRate * 100
												  ).toFixed(1)}%`
												: "N/A"}
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</Grid>
					)}
				</Grid>
			</Paper>
		</Container>
	);
};

export default ExamDetail;
