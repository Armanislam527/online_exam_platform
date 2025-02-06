import React, { useState, useEffect } from "react";
import {
	Container,
	Grid,
	Card,
	CardContent,
	CardActions,
	Typography,
	Button,
	Box,
	CircularProgress,
	Alert,
} from "@mui/material";
import { getSubscriptionPlans } from "../../services/subscriptionService";
import PaymentModal from "../payment/PaymentModal";

function SubscriptionPlans() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [plans, setPlans] = useState([]);
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [showPaymentModal, setShowPaymentModal] = useState(false);

	useEffect(() => {
		fetchPlans();
	}, []);

	const fetchPlans = async () => {
		try {
			setLoading(true);
			const data = await getSubscriptionPlans();
			setPlans(data);
			setError("");
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSubscribe = (plan) => {
		setSelectedPlan(plan);
		setShowPaymentModal(true);
	};

	const handlePaymentSuccess = (result) => {
		// Handle successful payment
		console.log("Payment successful:", result);
		// You might want to refresh the user's subscription status here
	};

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="60vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			<Typography variant="h4" component="h1" gutterBottom align="center">
				Subscription Plans
			</Typography>

			<Grid container spacing={4} sx={{ mt: 2 }}>
				{plans.map((plan) => (
					<Grid item key={plan.id} xs={12} sm={6} md={4}>
						<Card
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								position: "relative",
							}}>
							{plan.popular && (
								<Box
									sx={{
										position: "absolute",
										top: 16,
										right: -32,
										transform: "rotate(45deg)",
										backgroundColor: "primary.main",
										color: "white",
										px: 4,
										py: 0.5,
									}}>
									Popular
								</Box>
							)}
							<CardContent sx={{ flexGrow: 1 }}>
								<Typography
									gutterBottom
									variant="h5"
									component="h2"
									align="center">
									{plan.name}
								</Typography>
								<Typography
									variant="h4"
									color="primary"
									align="center"
									gutterBottom>
									৳{plan.price}
									<Typography
										variant="caption"
										color="text.secondary">
										/{plan.duration}
									</Typography>
								</Typography>
								<Box sx={{ mt: 2 }}>
									{plan.features.map((feature, index) => (
										<Typography
											key={index}
											variant="body1"
											color="text.secondary"
											sx={{ mt: 1 }}>
											• {feature}
										</Typography>
									))}
								</Box>
							</CardContent>
							<CardActions
								sx={{ justifyContent: "center", pb: 2 }}>
								<Button
									variant="contained"
									size="large"
									onClick={() => handleSubscribe(plan)}>
									Subscribe Now
								</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>

			{selectedPlan && (
				<PaymentModal
					open={showPaymentModal}
					onClose={() => setShowPaymentModal(false)}
					amount={selectedPlan.price}
					purpose={`Subscription to ${selectedPlan.name} plan`}
					onSuccess={handlePaymentSuccess}
				/>
			)}
		</Container>
	);
}

export default SubscriptionPlans;
