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
	ListItemSecondaryAction,
	IconButton,
	Divider,
	CircularProgress,
} from "@mui/material";
import {
	Add as AddIcon,
	VideoCall as VideoCallIcon,
	Edit as EditIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CoachingDashboard() {
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalStudents: 0,
		activeClasses: 0,
		totalCourses: 0,
	});
	const [upcomingClasses, setUpcomingClasses] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const [statsResponse, classesResponse] = await Promise.all([
					axios.get(
						`${process.env.REACT_APP_API_URL}/api/coaching/stats`
					),
					axios.get(
						`${process.env.REACT_APP_API_URL}/api/coaching/classes/upcoming`
					),
				]);

				setStats(statsResponse.data);
				setUpcomingClasses(classesResponse.data);
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
					Coaching Dashboard
				</Typography>
				<Box>
					<Button
						variant="contained"
						startIcon={<VideoCallIcon />}
						onClick={() => navigate("/live-class/create")}
						sx={{ mr: 2 }}>
						Start Live Class
					</Button>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => navigate("/coaching/course/create")}>
						Create Course
					</Button>
				</Box>
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
							Total Students
						</Typography>
						<Typography variant="h3">
							{stats.totalStudents}
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
							Active Classes
						</Typography>
						<Typography variant="h3">
							{stats.activeClasses}
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
							Total Courses
						</Typography>
						<Typography variant="h3">
							{stats.totalCourses}
						</Typography>
					</Paper>
				</Grid>

				{/* Upcoming Classes */}
				<Grid item xs={12}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Upcoming Live Classes
						</Typography>
						<List>
							{upcomingClasses.map((classItem, index) => (
								<React.Fragment key={classItem.id}>
									<ListItem sx={{ py: 2 }}>
										<ListItemText
											primary={classItem.title}
											secondary={
												<>
													<Typography
														component="span"
														variant="body2"
														color="text.primary">
														{new Date(
															classItem.scheduledAt
														).toLocaleString()}
													</Typography>
													{` — ${classItem.enrolledStudents} students enrolled`}
												</>
											}
										/>
										<ListItemSecondaryAction>
											<IconButton
												edge="end"
												aria-label="edit"
												onClick={() =>
													navigate(
														`/live-class/${classItem.id}/edit`
													)
												}
												sx={{ mr: 1 }}>
												<EditIcon />
											</IconButton>
											<Button
												variant="contained"
												color="primary"
												onClick={() =>
													navigate(
														`/live-class/${classItem.id}`
													)
												}>
												Join
											</Button>
										</ListItemSecondaryAction>
									</ListItem>
									{index < upcomingClasses.length - 1 && (
										<Divider />
									)}
								</React.Fragment>
							))}
							{upcomingClasses.length === 0 && (
								<ListItem>
									<ListItemText
										primary="No upcoming classes"
										secondary="Click the 'Start Live Class' button to schedule a new class"
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

export default CoachingDashboard;
