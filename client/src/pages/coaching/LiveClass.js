import React, { useState, useEffect } from "react";
import {
	Container,
	Grid,
	Paper,
	Typography,
	Box,
	Button,
	IconButton,
	CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import axiosInstance from "../../services/axiosConfig";

const LiveClass = () => {
	const { classId } = useParams();
	const [loading, setLoading] = useState(true);
	const [classDetails, setClassDetails] = useState(null);
	const [error, setError] = useState(null);
	const [audioEnabled, setAudioEnabled] = useState(true);
	const [videoEnabled, setVideoEnabled] = useState(true);
	const [screenSharing, setScreenSharing] = useState(false);
	const [chatOpen, setChatOpen] = useState(false);

	const fetchClassDetails = async () => {
		try {
			const response = await axiosInstance.get(
				`/coaching/live-class/${classId}`
			);
			setClassDetails(response.data);
			setError(null);
		} catch (error) {
			console.error("Error fetching class details:", error);
			setError(
				error.response?.data?.message || "Failed to load class details"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (classId) {
			fetchClassDetails();
		}
	}, [classId]);

	const toggleAudio = () => {
		setAudioEnabled(!audioEnabled);
		// Implement audio toggle logic
	};

	const toggleVideo = () => {
		setVideoEnabled(!videoEnabled);
		// Implement video toggle logic
	};

	const toggleScreenShare = () => {
		setScreenSharing(!screenSharing);
		// Implement screen sharing logic
	};

	const toggleChat = () => {
		setChatOpen(!chatOpen);
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
				<Typography color="error" variant="h6" align="center">
					{error}
				</Typography>
			</Container>
		);
	}

	return (
		<Container
			maxWidth="xl"
			sx={{ mt: 2, mb: 2, height: "calc(100vh - 100px)" }}>
			<Grid container spacing={2} sx={{ height: "100%" }}>
				<Grid item xs={chatOpen ? 9 : 12}>
					<Paper
						sx={{
							height: "100%",
							display: "flex",
							flexDirection: "column",
							bgcolor: "black",
						}}>
						{/* Main video container */}
						<Box
							sx={{
								flex: 1,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								color: "white",
							}}>
							{videoEnabled ? (
								<Typography>Video Stream</Typography>
							) : (
								<Typography>Video Disabled</Typography>
							)}
						</Box>

						{/* Control bar */}
						<Box
							sx={{
								p: 2,
								bgcolor: "rgba(0, 0, 0, 0.8)",
								display: "flex",
								justifyContent: "center",
								gap: 2,
							}}>
							<IconButton
								color="primary"
								onClick={toggleAudio}
								sx={{ bgcolor: "background.paper" }}>
								{audioEnabled ? <MicIcon /> : <MicOffIcon />}
							</IconButton>
							<IconButton
								color="primary"
								onClick={toggleVideo}
								sx={{ bgcolor: "background.paper" }}>
								{videoEnabled ? (
									<VideocamIcon />
								) : (
									<VideocamOffIcon />
								)}
							</IconButton>
							<IconButton
								color="primary"
								onClick={toggleScreenShare}
								sx={{ bgcolor: "background.paper" }}>
								{screenSharing ? (
									<StopScreenShareIcon />
								) : (
									<ScreenShareIcon />
								)}
							</IconButton>
							<IconButton
								color="primary"
								onClick={toggleChat}
								sx={{ bgcolor: "background.paper" }}>
								<ChatIcon />
							</IconButton>
						</Box>
					</Paper>
				</Grid>

				{chatOpen && (
					<Grid item xs={3}>
						<Paper
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								p: 2,
							}}>
							<Typography variant="h6" gutterBottom>
								Chat
							</Typography>
							{/* Add chat component here */}
						</Paper>
					</Grid>
				)}
			</Grid>

			{classDetails && (
				<Grid container spacing={3} sx={{ mt: 2 }}>
					<Grid item xs={12}>
						<Paper sx={{ p: 3 }}>
							<Typography variant="h4" gutterBottom>
								{classDetails.title}
							</Typography>
							<Typography
								variant="subtitle1"
								color="textSecondary"
								gutterBottom>
								Instructor: {classDetails.instructor}
							</Typography>
							<Typography variant="body1" paragraph>
								{classDetails.description}
							</Typography>
							<Box mt={3}>
								<Typography variant="h6" gutterBottom>
									Class Details
								</Typography>
								<Typography>
									Date:{" "}
									{new Date(
										classDetails.scheduledAt
									).toLocaleString()}
								</Typography>
								<Typography>
									Duration: {classDetails.duration} minutes
								</Typography>
								<Typography>
									Students Enrolled:{" "}
									{classDetails.enrolledStudents}
								</Typography>
							</Box>
						</Paper>
					</Grid>
				</Grid>
			)}
		</Container>
	);
};

export default LiveClass;
