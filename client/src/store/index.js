import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import examReducer from './slices/examSlice';
import coachingReducer from './slices/coachingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    exam: examReducer,
    coaching: coachingReducer,
  },
});

export default store;
