import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const createExam = createAsyncThunk(
  'exam/createExam',
  async (examData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/exam`, examData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getExams = createAsyncThunk(
  'exam/getExams',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      };

      const response = await axios.get(`${API_URL}/exam`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getExamById = createAsyncThunk(
  'exam/getExamById',
  async (examId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/exam/${examId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateExam = createAsyncThunk(
  'exam/updateExam',
  async ({ examId, examData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.patch(
        `${API_URL}/exam/${examId}`,
        examData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const submitExam = createAsyncThunk(
  'exam/submitExam',
  async ({ examId, answers }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/exam/${examId}/submit`,
        { answers },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  exams: [],
  currentExam: null,
  loading: false,
  error: null,
  examResults: null,
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    clearExamError: (state) => {
      state.error = null;
    },
    clearCurrentExam: (state) => {
      state.currentExam = null;
    },
    clearExamResults: (state) => {
      state.examResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Exam
      .addCase(createExam.pending, (state) => {
        state.loading = true;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.loading = false;
        state.exams.push(action.payload);
        state.currentExam = action.payload;
      })
      .addCase(createExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create exam';
      })
      // Get Exams
      .addCase(getExams.pending, (state) => {
        state.loading = true;
      })
      .addCase(getExams.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = action.payload;
      })
      .addCase(getExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch exams';
      })
      // Get Exam by ID
      .addCase(getExamById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getExamById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExam = action.payload;
      })
      .addCase(getExamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch exam';
      })
      // Update Exam
      .addCase(updateExam.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExam = action.payload;
        state.exams = state.exams.map((exam) =>
          exam._id === action.payload._id ? action.payload : exam
        );
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update exam';
      })
      // Submit Exam
      .addCase(submitExam.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.loading = false;
        state.examResults = action.payload;
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to submit exam';
      });
  },
});

export const { clearExamError, clearCurrentExam, clearExamResults } =
  examSlice.actions;

export default examSlice.reducer;
