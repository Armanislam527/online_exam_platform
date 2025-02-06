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
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setError("");
			setLoading(true);
			await login(email, password);
			navigate("/dashboard");
		} catch (error) {
			setError(error.message || "Failed to sign in");
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
						Sign In
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
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}>
							{loading ? "Signing in..." : "Sign In"}
						</Button>
						<Box sx={{ textAlign: "center" }}>
							<Link
								component={RouterLink}
								to="/register"
								variant="body2">
								{"Don't have an account? Sign Up"}
							</Link>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}

export default Login;
