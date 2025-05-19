import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
  user: null,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoadStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginStart: (state) => {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      localStorage.setItem('token', action.payload.token);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.error = null;
    },
    userLoaded: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    userLoadError: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = 'Failed to load user data';
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  userLoadStart,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  userLoaded,
  userLoadError,
  clearError
} = authSlice.actions;

export default authSlice.reducer; 