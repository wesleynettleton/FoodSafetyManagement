import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { recordsAPI } from '../services/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CoolingTemperatureAddPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    foodName: '',
    coolingStartTime: new Date(),
    movedToStorageTime: new Date(),
    temperatureAfter90Min: '',
    temperatureAfter2Hours: '',
    correctiveActions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check 2-hour temperature validation
    if (name === 'temperatureAfter2Hours') {
      const temp = parseFloat(value);
      if (!isNaN(temp) && temp > 8) {
        setWarning('Temperature above 8°C after 2 hours requires corrective action');
      } else {
        setWarning('');
      }
    }
  };

  const handleDateChange = (name) => (newValue) => {
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setWarning('');

    // Basic validation
    if (!formData.foodName || !formData.temperatureAfter90Min || !formData.temperatureAfter2Hours) {
      setError('Food name and temperatures are required.');
      setLoading(false);
      return;
    }

    if (isNaN(parseFloat(formData.temperatureAfter90Min)) || isNaN(parseFloat(formData.temperatureAfter2Hours))) {
      setError('Temperatures must be valid numbers.');
      setLoading(false);
      return;
    }

    const temp2Hours = parseFloat(formData.temperatureAfter2Hours);
    if (temp2Hours > 8 && !formData.correctiveActions) {
      setError('Corrective actions are required when temperature is above 8°C after 2 hours.');
      setLoading(false);
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        temperatureAfter90Min: parseFloat(formData.temperatureAfter90Min),
        temperatureAfter2Hours: temp2Hours
      };
      
      await recordsAPI.createCoolingTemperature(dataToSubmit);
      setSuccess('Cooling temperature record created successfully!');
      setFormData({
        foodName: '',
        coolingStartTime: new Date(),
        movedToStorageTime: new Date(),
        temperatureAfter90Min: '',
        temperatureAfter2Hours: '',
        correctiveActions: ''
      });
      setTimeout(() => navigate('/records/cooling-temperature'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create cooling temperature record. Please try again.');
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
          Add New Cooling Temperature Record
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {warning && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setWarning('')}>{warning}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="foodName"
              label="Food Item Name"
              name="foodName"
              value={formData.foodName}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Cooling Start Time"
                value={formData.coolingStartTime}
                onChange={handleDateChange('coolingStartTime')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    disabled={loading}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Time Moved to Storage"
                value={formData.movedToStorageTime}
                onChange={handleDateChange('movedToStorageTime')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    disabled={loading}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="temperatureAfter90Min"
              label="Temperature After 90 Minutes (°C)"
              name="temperatureAfter90Min"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.temperatureAfter90Min}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="temperatureAfter2Hours"
              label="Temperature After 2 Hours (°C)"
              name="temperatureAfter2Hours"
              type="number"
              inputProps={{ step: "0.1" }}
              value={formData.temperatureAfter2Hours}
              onChange={handleChange}
              disabled={loading}
              helperText="Must be below 8°C after 2 hours"
              error={parseFloat(formData.temperatureAfter2Hours) > 8}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="correctiveActions"
              label="Corrective Actions (required if temperature > 8°C after 2 hours)"
              name="correctiveActions"
              multiline
              rows={4}
              value={formData.correctiveActions}
              onChange={handleChange}
              disabled={loading}
              required={parseFloat(formData.temperatureAfter2Hours) > 8}
              error={parseFloat(formData.temperatureAfter2Hours) > 8 && !formData.correctiveActions}
              helperText={parseFloat(formData.temperatureAfter2Hours) > 8 && !formData.correctiveActions ? 
                "Corrective actions are required when temperature is above 8°C" : ""}
            />
          </Grid>
        </Grid>

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

export default CoolingTemperatureAddPage; 