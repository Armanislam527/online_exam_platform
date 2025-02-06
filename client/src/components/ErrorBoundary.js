import React, { Component } from "react";
import { Box, Typography, Button } from "@mui/material";

class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		this.setState({
			error: error,
			errorInfo: errorInfo,
		});
		// You can also log the error to an error reporting service here
		console.error("Error caught by ErrorBoundary:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
		window.location.href = "/";
	};

	render() {
		if (this.state.hasError) {
			return (
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					minHeight="100vh"
					p={3}
					textAlign="center">
					<Typography variant="h4" color="error" gutterBottom>
						Something went wrong
					</Typography>
					<Typography variant="body1" color="textSecondary" paragraph>
						We apologize for the inconvenience. Please try
						refreshing the page or return to the homepage.
					</Typography>
					<Button
						variant="contained"
						color="primary"
						onClick={this.handleReset}
						sx={{ mt: 2 }}>
						Return to Homepage
					</Button>
					{process.env.NODE_ENV === "development" &&
						this.state.error && (
							<Box
								mt={4}
								textAlign="left"
								width="100%"
								maxWidth="800px">
								<Typography
									variant="h6"
									color="error"
									gutterBottom>
									Error Details (Development Only):
								</Typography>
								<pre
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
										backgroundColor: "#f5f5f5",
										padding: "1rem",
										borderRadius: "4px",
									}}>
									{this.state.error.toString()}
									{"\n\n"}
									{this.state.errorInfo.componentStack}
								</pre>
							</Box>
						)}
				</Box>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
