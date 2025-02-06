import React, { useState, useEffect } from "react";
import {
	Container,
	Grid,
	Paper,
	Typography,
	Button,
	Box,
	List,
	ListItem,
	ListItemText,
	Divider,
	CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ExaminerDashboard() {
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalExams: 0,
		activeExams: 0,
		totalParticipants: 0,
	});
	const [recentExams, setRecentExams] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const [statsResponse, examsResponse] = await Promise.all([
					axios.get(
						`${process.env.REACT_APP_API_URL}/api/examiner/stats`
					),
					axios.get(
						`${process.env.REACT_APP_API_URL}/api/examiner/exams/recent`
					),
				]);

				setStats(statsResponse.data);
				setRecentExams(examsResponse.data);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

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

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				mb={4}>
				<Typography variant="h4" component="h1">
					Examiner Dashboard
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => navigate("/exam/create")}>
					Create New Exam
				</Button>
			</Box>

			<Grid container spacing={3}>
				{/* Stats Cards */}
				<Grid item xs={12} sm={4}>
					<Paper
						sx={{
							p: 3,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							height: "100%",
						}}>
						<Typography variant="h6" gutterBottom>
							Total Exams
						</Typography>
						<Typography variant="h3">{stats.totalExams}</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Paper
						sx={{
							p: 3,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							height: "100%",
						}}>
						<Typography variant="h6" gutterBottom>
							Active Exams
						</Typography>
						<Typography variant="h3">
							{stats.activeExams}
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Paper
						sx={{
							p: 3,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							height: "100%",
						}}>
						<Typography variant="h6" gutterBottom>
							Total Participants
						</Typography>
						<Typography variant="h3">
							{stats.totalParticipants}
						</Typography>
					</Paper>
				</Grid>

				{/* Recent Exams */}
				<Grid item xs={12}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Recent Exams
						</Typography>
						<List>
							{recentExams.map((exam, index) => (
								<React.Fragment key={exam.id}>
									<ListItem
										button
										onClick={() =>
											navigate(`/exam/${exam.id}`)
										}
										sx={{ py: 2 }}>
										<ListItemText
											primary={exam.title}
											secondary={
												<>
													<Typography
														component="span"
														variant="body2"
														color="text.primary">
														{new Date(
															exam.scheduledAt
														).toLocaleDateString()}
													</Typography>
													{` — ${exam.participants} participants`}
												</>
											}
										/>
										<Typography
											variant="body2"
											color={
												exam.status === "active"
													? "success.main"
													: "text.secondary"
											}>
											{exam.status
												.charAt(0)
												.toUpperCase() +
												exam.status.slice(1)}
										</Typography>
									</ListItem>
									{index < recentExams.length - 1 && (
										<Divider />
									)}
								</React.Fragment>
							))}
							{recentExams.length === 0 && (
								<ListItem>
									<ListItemText
										primary="No exams created yet"
										secondary="Click the 'Create New Exam' button to get started"
									/>
								</ListItem>
							)}
						</List>
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
}

export default ExaminerDashboard;
