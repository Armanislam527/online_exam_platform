import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	exams: [],
	currentExam: null,
	loading: false,
	error: null,
};

const examSlice = createSlice({
	name: "exam",
	initialState,
	reducers: {
		fetchExamsStart: (state) => {
			state.loading = true;
			state.error = null;
		},
		fetchExamsSuccess: (state, action) => {
			state.loading = false;
			state.exams = action.payload;
		},
		fetchExamsFailure: (state, action) => {
			state.loading = false;
			state.error = action.payload;
		},
		setCurrentExam: (state, action) => {
			state.currentExam = action.payload;
		},
	},
});

export const {
	fetchExamsStart,
	fetchExamsSuccess,
	fetchExamsFailure,
	setCurrentExam,
} = examSlice.actions;
export default examSlice.reducer;
