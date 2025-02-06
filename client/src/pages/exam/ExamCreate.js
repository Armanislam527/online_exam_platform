import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
	Container,
	Paper,
	Typography,
	TextField,
	Button,
	Box,
	Alert,
	Grid,
	IconButton,
	Card,
	CardContent,
	FormControlLabel,
	Switch,
	Divider,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { createExam } from "../../store/slices/examSlice";
import axiosInstance from "../../services/axiosConfig";

const validationSchema = Yup.object({
	title: Yup.string().required("Title is required"),
	description: Yup.string().required("Description is required"),
	category: Yup.string().required("Category is required"),
	duration: Yup.number()
		.min(1, "Duration must be at least 1 minute")
		.required("Duration is required"),
	startTime: Yup.date().required("Start time is required"),
	endTime: Yup.date()
		.min(Yup.ref("startTime"), "End time must be after start time")
		.required("End time is required"),
	totalMarks: Yup.number()
		.min(1, "Total marks must be at least 1")
		.required("Total marks is required"),
	passingMarks: Yup.number()
		.min(0, "Passing marks cannot be negative")
		.max(Yup.ref("totalMarks"), "Passing marks cannot exceed total marks")
		.required("Passing marks is required"),
	price: Yup.number().min(0, "Price cannot be negative"),
	questions: Yup.array().of(
		Yup.object({
			text: Yup.string().required("Question text is required"),
			options: Yup.array()
				.of(
					Yup.object({
						text: Yup.string().required("Option text is required"),
						isCorrect: Yup.boolean(),
					})
				)
				.min(2, "At least 2 options are required"),
			category: Yup.string().required("Question category is required"),
			marks: Yup.number()
				.min(0, "Marks cannot be negative")
				.required("Marks are required"),
			negativeMarks: Yup.number()
				.min(0, "Negative marks cannot be negative")
				.required("Negative marks are required"),
		})
	),
});

const ExamCreate = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { error, loading } = useSelector((state) => state.exam);
	const [showPreview, setShowPreview] = useState(false);
	const [examData, setExamData] = useState({
		title: "",
		description: "",
		duration: 60,
		totalMarks: 100,
		passingMarks: 40,
		negativeMarking: 0,
		category: "",
		subcategory: "",
		startTime: "",
		endTime: "",
		instructions: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setExamData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await axiosInstance.post("/exams", examData);
			navigate(`/exam/${response.data.id}/questions`);
		} catch (error) {
			setError(error.response?.data?.message || "Failed to create exam");
		} finally {
			setLoading(false);
		}
	};

	const addQuestion = () => {
		const questions = [...examData.questions];
		questions.push({
			text: "",
			options: [
				{ text: "", isCorrect: false },
				{ text: "", isCorrect: false },
			],
			category: examData.category,
			subCategory: examData.subcategory,
			marks: 1,
			negativeMarks: 0,
			difficulty: "medium",
		});
		setExamData((prev) => ({
			...prev,
			questions: questions,
		}));
	};

	const removeQuestion = (index) => {
		const questions = [...examData.questions];
		questions.splice(index, 1);
		setExamData((prev) => ({
			...prev,
			questions: questions,
		}));
	};

	const addOption = (questionIndex) => {
		const questions = [...examData.questions];
		questions[questionIndex].options.push({ text: "", isCorrect: false });
		setExamData((prev) => ({
			...prev,
			questions: questions,
		}));
	};

	const removeOption = (questionIndex, optionIndex) => {
		const questions = [...examData.questions];
		questions[questionIndex].options.splice(optionIndex, 1);
		setExamData((prev) => ({
			...prev,
			questions: questions,
		}));
	};

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<Paper sx={{ p: 4 }}>
				<Typography variant="h4" gutterBottom>
					Create New Exam
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				<Box component="form" onSubmit={handleSubmit}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								label="Exam Title"
								name="title"
								value={examData.title}
								onChange={handleChange}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								multiline
								rows={4}
								label="Description"
								name="description"
								value={examData.description}
								onChange={handleChange}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								type="number"
								label="Duration (minutes)"
								name="duration"
								value={examData.duration}
								onChange={handleChange}
								inputProps={{ min: 1 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								type="number"
								label="Total Marks"
								name="totalMarks"
								value={examData.totalMarks}
								onChange={handleChange}
								inputProps={{ min: 0 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								type="number"
								label="Passing Marks"
								name="passingMarks"
								value={examData.passingMarks}
								onChange={handleChange}
								inputProps={{ min: 0 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								type="number"
								label="Negative Marking (per question)"
								name="negativeMarking"
								value={examData.negativeMarking}
								onChange={handleChange}
								inputProps={{ min: 0, step: 0.25 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<FormControl fullWidth required>
								<InputLabel>Category</InputLabel>
								<Select
									name="category"
									value={examData.category}
									onChange={handleChange}
									label="Category">
									<MenuItem value="mathematics">
										Mathematics
									</MenuItem>
									<MenuItem value="science">Science</MenuItem>
									<MenuItem value="english">English</MenuItem>
									<MenuItem value="programming">
										Programming
									</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<InputLabel>Subcategory</InputLabel>
								<Select
									name="subcategory"
									value={examData.subcategory}
									onChange={handleChange}
									label="Subcategory">
									<MenuItem value="algebra">Algebra</MenuItem>
									<MenuItem value="geometry">
										Geometry
									</MenuItem>
									<MenuItem value="physics">Physics</MenuItem>
									<MenuItem value="chemistry">
										Chemistry
									</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								type="datetime-local"
								label="Start Time"
								name="startTime"
								value={examData.startTime}
								onChange={handleChange}
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								type="datetime-local"
								label="End Time"
								name="endTime"
								value={examData.endTime}
								onChange={handleChange}
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								multiline
								rows={4}
								label="Instructions"
								name="instructions"
								value={examData.instructions}
								onChange={handleChange}
								helperText="Enter exam instructions for students"
							/>
						</Grid>

						<Grid item xs={12}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 2,
								}}>
								<Typography variant="h6">Questions</Typography>
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={addQuestion}>
									Add Question
								</Button>
							</Box>
							{examData.questions.map(
								(question, questionIndex) => (
									<Card key={questionIndex} sx={{ mb: 2 }}>
										<CardContent>
											<Grid container spacing={2}>
												<Grid item xs={12}>
													<TextField
														fullWidth
														multiline
														rows={2}
														name={`questions.${questionIndex}.text`}
														label="Question Text"
														value={question.text}
														onChange={handleChange}
														error={
															examData
																.questions?.[
																questionIndex
															]?.text &&
															Boolean(
																examData
																	.questions?.[
																	questionIndex
																]?.text
															)
														}
														helperText={
															examData
																.questions?.[
																questionIndex
															]?.text &&
															examData
																.questions?.[
																questionIndex
															]?.text
														}
													/>
												</Grid>
												<Grid item xs={12} md={6}>
													<TextField
														fullWidth
														type="number"
														name={`questions.${questionIndex}.marks`}
														label="Marks"
														value={question.marks}
														onChange={handleChange}
													/>
												</Grid>
												<Grid item xs={12} md={6}>
													<TextField
														fullWidth
														type="number"
														name={`questions.${questionIndex}.negativeMarks`}
														label="Negative Marks"
														value={
															question.negativeMarks
														}
														onChange={handleChange}
													/>
												</Grid>
												<Grid item xs={12}>
													<Typography variant="subtitle1">
														Options
													</Typography>
													{question.options.map(
														(
															option,
															optionIndex
														) => (
															<Box
																key={
																	optionIndex
																}
																sx={{
																	display:
																		"flex",
																	alignItems:
																		"center",
																	mb: 1,
																}}>
																<TextField
																	fullWidth
																	name={`questions.${questionIndex}.options.${optionIndex}.text`}
																	label={`Option ${
																		optionIndex +
																		1
																	}`}
																	value={
																		option.text
																	}
																	onChange={
																		handleChange
																	}
																	sx={{
																		mr: 1,
																	}}
																/>
																<FormControlLabel
																	control={
																		<Switch
																			checked={
																				option.isCorrect
																			}
																			onChange={(
																				e
																			) =>
																				handleChange(
																					{
																						target: {
																							name: `questions.${questionIndex}.options.${optionIndex}.isCorrect`,
																							value: e
																								.target
																								.checked,
																						},
																					}
																				)
																			}
																		/>
																	}
																	label="Correct"
																/>
																<IconButton
																	onClick={() =>
																		removeOption(
																			questionIndex,
																			optionIndex
																		)
																	}
																	disabled={
																		question
																			.options
																			.length <=
																		2
																	}>
																	<DeleteIcon />
																</IconButton>
															</Box>
														)
													)}
													<Button
														onClick={() =>
															addOption(
																questionIndex
															)
														}>
														Add Option
													</Button>
												</Grid>
											</Grid>
											<Box
												sx={{
													mt: 2,
													display: "flex",
													justifyContent: "flex-end",
												}}>
												<Button
													variant="outlined"
													color="error"
													onClick={() =>
														removeQuestion(
															questionIndex
														)
													}>
													Remove Question
												</Button>
											</Box>
										</CardContent>
									</Card>
								)
							)}
						</Grid>

						<Grid item xs={12}>
							<Box
								sx={{
									display: "flex",
									gap: 2,
									justifyContent: "flex-end",
								}}>
								<Button
									variant="outlined"
									onClick={() => navigate("/exams")}
									disabled={loading}>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={loading}>
									{loading ? "Creating..." : "Create Exam"}
								</Button>
							</Box>
						</Grid>
					</Grid>
				</Box>
			</Paper>
		</Container>
	);
};

export default ExamCreate;
