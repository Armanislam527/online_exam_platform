import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import examReducer from "./slices/examSlice";
import courseReducer from "./slices/courseSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		exam: examReducer,
		course: courseReducer,
	},
});
