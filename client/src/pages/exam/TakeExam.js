import React, { useState, useEffect } from "react";
import {
	Container,
	Typography,
	Box,
	Paper,
	Button,
	CircularProgress,
	Alert,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	FormLabel,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosConfig";

function TakeExam() {
	const { examId } = useParams();
	const navigate = useNavigate();
	const [exam, setExam] = useState(null);
	const [answers, setAnswers] = useState({});
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [timeLeft, setTimeLeft] = useState(null);
	const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchExam();
	}, [examId]);

	useEffect(() => {
		if (exam) {
			const endTime = new Date(exam.endTime).getTime();
			const interval = setInterval(() => {
				const now = new Date().getTime();
				const distance = endTime - now;

				if (distance < 0) {
					clearInterval(interval);
					handleSubmitExam();
				} else {
					setTimeLeft(distance);
				}
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [exam]);

	const fetchExam = async () => {
		try {
			const response = await axiosInstance.get(`/exams/${examId}/take`);
			setExam(response.data);
			setTimeLeft(response.data.duration * 60 * 1000); // Convert minutes to milliseconds
			setError("");
		} catch (error) {
			setError(error.response?.data?.message || "Failed to load exam");
		} finally {
			setLoading(false);
		}
	};

	const handleAnswerChange = (questionId, value) => {
		setAnswers((prev) => ({
			...prev,
			[questionId]: value,
		}));
	};

	const handleSubmitExam = async () => {
		try {
			setSubmitting(true);
			const response = await axiosInstance.post(
				`/exams/${examId}/submit`,
				{
					answers,
				}
			);
			navigate(`/exam/${examId}/result`, {
				state: { result: response.data },
			});
		} catch (error) {
			setError(error.response?.data?.message || "Failed to submit exam");
			setSubmitting(false);
		}
	};

	const formatTime = (ms) => {
		if (!ms) return "00:00:00";
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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

	const currentQuestionData = exam.questions[currentQuestion];

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<Paper sx={{ p: 4 }}>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					mb={4}>
					<Typography variant="h4">{exam.title}</Typography>
					<Box>
						<Typography variant="h6" color="primary">
							Time Left: {formatTime(timeLeft)}
						</Typography>
					</Box>
				</Box>

				<Box mb={4}>
					<Typography variant="h6" gutterBottom>
						Question {currentQuestion + 1} of{" "}
						{exam.questions.length}
					</Typography>
					<Typography variant="body1" paragraph>
						{currentQuestionData.text}
					</Typography>

					<FormControl component="fieldset">
						<FormLabel component="legend">
							Select your answer:
						</FormLabel>
						<RadioGroup
							value={answers[currentQuestionData.id] || ""}
							onChange={(e) =>
								handleAnswerChange(
									currentQuestionData.id,
									e.target.value
								)
							}>
							{currentQuestionData.options.map(
								(option, index) => (
									<FormControlLabel
										key={index}
										value={option.id}
										control={<Radio />}
										label={option.text}
									/>
								)
							)}
						</RadioGroup>
					</FormControl>
				</Box>

				<Box display="flex" justifyContent="space-between">
					<Button
						variant="outlined"
						onClick={() => setCurrentQuestion((prev) => prev - 1)}
						disabled={currentQuestion === 0}>
						Previous
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							if (currentQuestion === exam.questions.length - 1) {
								setShowConfirmSubmit(true);
							} else {
								setCurrentQuestion((prev) => prev + 1);
							}
						}}>
						{currentQuestion === exam.questions.length - 1
							? "Submit"
							: "Next"}
					</Button>
				</Box>
			</Paper>

			<Dialog
				open={showConfirmSubmit}
				onClose={() => setShowConfirmSubmit(false)}>
				<DialogTitle>Confirm Submission</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to submit your exam? You cannot
						change your answers after submission.
					</Typography>
					<Box mt={2}>
						<Typography color="warning.main">
							Questions Answered: {Object.keys(answers).length} of{" "}
							{exam.questions.length}
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setShowConfirmSubmit(false)}
						disabled={submitting}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmitExam}
						variant="contained"
						color="primary"
						disabled={submitting}>
						{submitting ? "Submitting..." : "Confirm Submit"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

export default TakeExam;
