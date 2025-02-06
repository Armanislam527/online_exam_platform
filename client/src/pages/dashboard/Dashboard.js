import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

function Dashboard() {
	const navigate = useNavigate();
	const { currentUser } = useAuth();

	useEffect(() => {
		if (currentUser) {
			switch (currentUser.role) {
				case "examiner":
					navigate("/examiner/dashboard");
					break;
				case "coaching":
					navigate("/coaching/dashboard");
					break;
				case "student":
					navigate("/exams");
					break;
				default:
					// Handle unknown role
					console.error("Unknown user role:", currentUser.role);
			}
		}
	}, [currentUser, navigate]);

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

export default Dashboard;
