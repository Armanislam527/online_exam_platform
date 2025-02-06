import React, { useState } from "react";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Link,
	Alert,
	Paper,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Register() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "student",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { register } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			return setError("Passwords do not match");
		}

		try {
			setError("");
			setLoading(true);
			await register({
				name: formData.name,
				email: formData.email,
				password: formData.password,
				role: formData.role,
			});
			navigate("/dashboard");
		} catch (error) {
			setError(error.message || "Failed to create an account");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<Paper
					elevation={3}
					sx={{
						p: 4,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
					}}>
					<Typography component="h1" variant="h5" gutterBottom>
						Sign Up
					</Typography>
					{error && (
						<Alert severity="error" sx={{ width: "100%", mb: 2 }}>
							{error}
						</Alert>
					)}
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{ mt: 1, width: "100%" }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="name"
							label="Full Name"
							name="name"
							autoComplete="name"
							autoFocus
							value={formData.name}
							onChange={handleChange}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							value={formData.email}
							onChange={handleChange}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							value={formData.password}
							onChange={handleChange}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="confirmPassword"
							label="Confirm Password"
							type="password"
							id="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
						/>
						<FormControl fullWidth margin="normal">
							<InputLabel id="role-label">Role</InputLabel>
							<Select
								labelId="role-label"
								id="role"
								name="role"
								value={formData.role}
								label="Role"
								onChange={handleChange}>
								<MenuItem value="student">Student</MenuItem>
								<MenuItem value="examiner">Examiner</MenuItem>
								<MenuItem value="coaching">
									Coaching Center
								</MenuItem>
							</Select>
						</FormControl>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}>
							{loading ? "Creating Account..." : "Sign Up"}
						</Button>
						<Box sx={{ textAlign: "center" }}>
							<Link
								component={RouterLink}
								to="/login"
								variant="body2">
								Already have an account? Sign In
							</Link>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}

export default Register;
