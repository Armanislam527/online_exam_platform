import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const createCoachingCenter = createAsyncThunk(
  'coaching/createCenter',
  async (centerData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/coaching`,
        centerData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCoachingCenters = createAsyncThunk(
  'coaching/getCenters',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/coaching`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCoachingCenterById = createAsyncThunk(
  'coaching/getCenterById',
  async (centerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${API_URL}/coaching/${centerId}`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCoachingCenter = createAsyncThunk(
  'coaching/updateCenter',
  async ({ centerId, centerData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/coaching/${centerId}`,
        centerData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addStudent = createAsyncThunk(
  'coaching/addStudent',
  async ({ centerId, studentData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/coaching/${centerId}/students`,
        studentData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createNotice = createAsyncThunk(
  'coaching/createNotice',
  async ({ centerId, noticeData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/coaching/${centerId}/notices`,
        noticeData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const scheduleLiveClass = createAsyncThunk(
  'coaching/scheduleLiveClass',
  async ({ centerId, classData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/coaching/${centerId}/live-classes`,
        classData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  centers: [],
  currentCenter: null,
  loading: false,
  error: null,
  notices: [],
  liveClasses: [],
};

const coachingSlice = createSlice({
  name: 'coaching',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCenter: (state) => {
      state.currentCenter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Coaching Center
      .addCase(createCoachingCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCoachingCenter.fulfilled, (state, action) => {
        state.loading = false;
        state.centers.push(action.payload);
        state.currentCenter = action.payload;
      })
      .addCase(createCoachingCenter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create coaching center';
      })

      // Get Coaching Centers
      .addCase(getCoachingCenters.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCoachingCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.centers = action.payload;
      })
      .addCase(getCoachingCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch coaching centers';
      })

      // Get Coaching Center by ID
      .addCase(getCoachingCenterById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCoachingCenterById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCenter = action.payload;
      })
      .addCase(getCoachingCenterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch coaching center';
      })

      // Update Coaching Center
      .addCase(updateCoachingCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCoachingCenter.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCenter = action.payload;
        state.centers = state.centers.map((center) =>
          center._id === action.payload._id ? action.payload : center
        );
      })
      .addCase(updateCoachingCenter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update coaching center';
      })

      // Add Student
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCenter = action.payload;
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to add student';
      })

      // Create Notice
      .addCase(createNotice.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNotice.fulfilled, (state, action) => {
        state.loading = false;
        state.notices.push(action.payload);
        if (state.currentCenter) {
          state.currentCenter.notices.push(action.payload);
        }
      })
      .addCase(createNotice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create notice';
      })

      // Schedule Live Class
      .addCase(scheduleLiveClass.pending, (state) => {
        state.loading = true;
      })
      .addCase(scheduleLiveClass.fulfilled, (state, action) => {
        state.loading = false;
        state.liveClasses.push(action.payload);
        if (state.currentCenter) {
          state.currentCenter.liveClasses.push(action.payload);
        }
      })
      .addCase(scheduleLiveClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to schedule live class';
      });
  },
});

export const { clearError, clearCurrentCenter } = coachingSlice.actions;

export default coachingSlice.reducer;
