import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { recordsAPI } from '../services/api'; // Assuming recordsAPI has createDelivery

const DeliveryAddPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplier: '',
    temperature: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.supplier || formData.temperature === '') {
      setError('Supplier and Temperature are required.');
      setLoading(false);
      return;
    }
    if (isNaN(parseFloat(formData.temperature))) {
      setError('Temperature must be a valid number.');
      setLoading(false);
      return;
    }

    try {
      // The backend will handle adding type, location, createdBy, createdAt
      const dataToSubmit = {
        supplier: formData.supplier,
        temperature: parseFloat(formData.temperature),
        notes: formData.notes
      };
      
      await recordsAPI.createDelivery(dataToSubmit);
      setSuccess('Delivery record created successfully!');
      setFormData({ supplier: '', temperature: '', notes: '' }); // Clear form
      // Optionally navigate back or show success for longer
      setTimeout(() => navigate(-1), 2000); // Go back after 2 seconds
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create delivery record. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }} aria-label="go back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Add New Delivery Record
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="supplier"
          label="Supplier Name"
          name="supplier"
          autoComplete="organization"
          autoFocus
          value={formData.supplier}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="temperature"
          label="Temperature (°C)"
          name="temperature"
          type="number"
          inputProps={{ step: "0.1" }} // Allows decimal for temperature
          value={formData.temperature}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          margin="normal"
          fullWidth
          id="notes"
          label="Notes (optional)"
          name="notes"
          multiline
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          disabled={loading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Record'}
        </Button>
      </Box>
    </Container>
  );
};

export default DeliveryAddPage; 