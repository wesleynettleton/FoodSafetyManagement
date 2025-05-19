import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { recordsAPI } from '../services/api';

const FoodTemperatureAddPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    foodName: '',
    temperature: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await recordsAPI.createFoodTemperature(formData);
      setSuccess('Food temperature record created successfully!');
      setFormData({ foodName: '', temperature: '' }); // Clear form
      // Optionally, navigate to the list page after a short delay or on button click
      // setTimeout(() => navigate('/records/food-temperature/list'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.map(er => er.msg).join(', ') || 'Failed to create record.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Add New Food Temperature Record
        </Typography>
      </Box>
      
      <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 3, ml: '48px' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        <TextField
          autoFocus
          required
          fullWidth
          label="Food Name"
          name="foodName"
          value={formData.foodName}
          onChange={handleChange}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <TextField
          required
          fullWidth
          label="Temperature (°C)"
          name="temperature"
          type="number"
          value={formData.temperature}
          onChange={handleChange}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <Box sx={{ mt: 2, position: 'relative' }}>
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            Create Record
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default FoodTemperatureAddPage; 