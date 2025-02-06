import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const createCourse = createAsyncThunk(
  'course/create',
  async (courseData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/courses`,
        courseData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCourses = createAsyncThunk(
  'course/getAll',
  async ({ coachingId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${API_URL}/courses/coaching/${coachingId}`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCourseById = createAsyncThunk(
  'course/getById',
  async (courseId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${API_URL}/courses/${courseId}`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'course/update',
  async ({ courseId, courseData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/courses/${courseId}`,
        courseData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'course/delete',
  async (courseId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`${API_URL}/courses/${courseId}`, config);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addModule = createAsyncThunk(
  'course/addModule',
  async ({ courseId, moduleData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules`,
        moduleData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateModule = createAsyncThunk(
  'course/updateModule',
  async ({ courseId, moduleId, moduleData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/courses/${courseId}/modules/${moduleId}`,
        moduleData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteModule = createAsyncThunk(
  'course/deleteModule',
  async ({ courseId, moduleId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(
        `${API_URL}/courses/${courseId}/modules/${moduleId}`,
        config
      );
      return { courseId, moduleId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const enrollStudent = createAsyncThunk(
  'course/enroll',
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/courses/${courseId}/enroll`,
        { studentId },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
  success: false,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
        state.success = true;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create course';
      })

      // Get All Courses
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch courses';
      })

      // Get Course by ID
      .addCase(getCourseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch course';
      })

      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.courses = state.courses.map((course) =>
          course._id === action.payload._id ? action.payload : course
        );
        state.success = true;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update course';
      })

      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(
          (course) => course._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete course';
      })

      // Add Module
      .addCase(addModule.pending, (state) => {
        state.loading = true;
      })
      .addCase(addModule.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.success = true;
      })
      .addCase(addModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to add module';
      })

      // Update Module
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.success = true;
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update module';
      })

      // Delete Module
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCourse) {
          state.currentCourse.modules = state.currentCourse.modules.filter(
            (module) => module._id !== action.payload.moduleId
          );
        }
        state.success = true;
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete module';
      })

      // Enroll Student
      .addCase(enrollStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(enrollStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.success = true;
      })
      .addCase(enrollStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to enroll student';
      });
  },
});

export const { clearError, clearSuccess, clearCurrentCourse } = courseSlice.actions;

export default courseSlice.reducer;
