import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from '../services/api';
import { userLoadStart, userLoaded, userLoadError, logout } from '../redux/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

const AuthCheck = ({ children }) => {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(userLoadStart());
      authAPI.getCurrentUser()
        .then(response => {
          console.log('AuthCheck - User data from API:', response.data);
          dispatch(userLoaded(response.data));
        })
        .catch(err => {
          console.error('Error loading user in AuthCheck:', err);
          dispatch(userLoadError());
        });
    } else {
      dispatch(logout());
    }
  }, [token, dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
};

export default AuthCheck; 