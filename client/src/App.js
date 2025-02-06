import React, { Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import store from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/routing/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy load components
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));
const ExaminerDashboard = React.lazy(() =>
	import("./pages/dashboard/ExaminerDashboard")
);
const CoachingDashboard = React.lazy(() =>
	import("./pages/dashboard/CoachingDashboard")
);
const ExamList = React.lazy(() => import("./pages/exam/ExamList"));
const ExamCreate = React.lazy(() => import("./pages/exam/ExamCreate"));
const ExamDetail = React.lazy(() => import("./pages/exam/ExamDetail"));
const TakeExam = React.lazy(() => import("./pages/exam/TakeExam"));
const CoachingCenter = React.lazy(() =>
	import("./pages/coaching/CoachingCenter")
);
const LiveClass = React.lazy(() => import("./pages/coaching/LiveClass"));
const Profile = React.lazy(() => import("./pages/profile/Profile"));

// Loading component
const LoadingFallback = () => (
	<Box
		display="flex"
		justifyContent="center"
		alignItems="center"
		minHeight="100vh">
		<CircularProgress />
	</Box>
);

const theme = createTheme({
	palette: {
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: "#dc004e",
		},
		background: {
			default: "#f5f5f5",
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		fontSize: 14,
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightMedium: 500,
		fontWeightBold: 700,
	},
});

function App() {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<ErrorBoundary>
					<AuthProvider>
						<Suspense fallback={<LoadingFallback />}>
							<Routes>
								{/* Public routes */}
								<Route path="/login" element={<Login />} />
								<Route
									path="/register"
									element={<Register />}
								/>

								{/* Protected routes */}
								<Route
									path="/"
									element={
										<PrivateRoute>
											<Layout>
												<Outlet />
											</Layout>
										</PrivateRoute>
									}>
									<Route
										index
										element={
											<Navigate to="/dashboard" replace />
										}
									/>
									<Route
										path="dashboard"
										element={<Dashboard />}
									/>
									<Route
										path="examiner/dashboard"
										element={<ExaminerDashboard />}
									/>
									<Route
										path="exam/create"
										element={<ExamCreate />}
									/>
									<Route
										path="coaching/dashboard"
										element={<CoachingDashboard />}
									/>
									<Route
										path="coaching/:id"
										element={<CoachingCenter />}
									/>
									<Route
										path="live-class/:id"
										element={<LiveClass />}
									/>
									<Route
										path="exams"
										element={<ExamList />}
									/>
									<Route
										path="exam/:id"
										element={<ExamDetail />}
									/>
									<Route
										path="exam/:id/take"
										element={<TakeExam />}
									/>
									<Route
										path="profile"
										element={<Profile />}
									/>
								</Route>

								{/* 404 route */}
								<Route
									path="*"
									element={<Navigate to="/" replace />}
								/>
							</Routes>
						</Suspense>
					</AuthProvider>
				</ErrorBoundary>
			</ThemeProvider>
		</Provider>
	);
}

export default App;
