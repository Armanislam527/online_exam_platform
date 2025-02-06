import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const getAdminStats = createAsyncThunk(
  'admin/getStats',
  async ({ timeRange }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/admin/stats`, {
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const getPaymentAnalytics = createAsyncThunk(
  'admin/getPaymentAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/payments/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch payment analytics'
      );
    }
  }
);

export const getUserAnalytics = createAsyncThunk(
  'admin/getUserAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/users/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user analytics'
      );
    }
  }
);

export const getCourseAnalytics = createAsyncThunk(
  'admin/getCourseAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/courses/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch course analytics'
      );
    }
  }
);

export const getExamAnalytics = createAsyncThunk(
  'admin/getExamAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/admin/exams/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch exam analytics'
      );
    }
  }
);

const initialState = {
  stats: null,
  paymentAnalytics: null,
  userAnalytics: null,
  courseAnalytics: null,
  examAnalytics: null,
  loading: false,
  error: null,
  success: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Admin Stats
      .addCase(getAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Payment Analytics
      .addCase(getPaymentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentAnalytics = action.payload;
      })
      .addCase(getPaymentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Analytics
      .addCase(getUserAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.userAnalytics = action.payload;
      })
      .addCase(getUserAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Course Analytics
      .addCase(getCourseAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.courseAnalytics = action.payload;
      })
      .addCase(getCourseAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Exam Analytics
      .addCase(getExamAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExamAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.examAnalytics = action.payload;
      })
      .addCase(getExamAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = adminSlice.actions;
export default adminSlice.reducer;
