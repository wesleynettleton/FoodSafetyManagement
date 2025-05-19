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
  IconButton,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { recordsAPI } from '../services/api';

const ProbeCalibrationAddPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    probeId: '',
    iceWaterTemp: '',
    boilingWaterTemp: '',
    isCalibrated: true,
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isCalibrated' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate both temperatures
      const iceTemp = parseFloat(formData.iceWaterTemp);
      const boilingTemp = parseFloat(formData.boilingWaterTemp);
      
      const isIceValid = iceTemp >= -1 && iceTemp <= 1;
      const isBoilingValid = boilingTemp >= 99 && boilingTemp <= 101;

      if (!isIceValid || !isBoilingValid) {
        const errors = [];
        if (!isIceValid) errors.push('Ice water temperature should be 0°C (±1°C)');
        if (!isBoilingValid) errors.push('Boiling water temperature should be 100°C (±1°C)');
        setError(errors.join('\n'));
        setLoading(false);
        return;
      }

      // Create two separate records - one for each calibration method
      await Promise.all([
        recordsAPI.createProbeCalibration({
          probeId: formData.probeId,
          temperature: formData.iceWaterTemp,
          calibrationMethod: 'ice',
          isCalibrated: formData.isCalibrated,
          notes: formData.notes
        }),
        recordsAPI.createProbeCalibration({
          probeId: formData.probeId,
          temperature: formData.boilingWaterTemp,
          calibrationMethod: 'boiling',
          isCalibrated: formData.isCalibrated,
          notes: formData.notes
        })
      ]);

      setSuccess('Probe calibration records created successfully!');
      setFormData({
        probeId: '',
        iceWaterTemp: '',
        boilingWaterTemp: '',
        isCalibrated: true,
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.map(er => er.msg).join(', ') || 'Failed to create records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Add New Probe Calibration
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
          required
          fullWidth
          label="Probe ID"
          name="probeId"
          value={formData.probeId}
          onChange={handleChange}
          sx={{ mb: 3 }}
          disabled={loading}
          placeholder="e.g., PROBE-001"
        />

        <Typography variant="h6" sx={{ mb: 2 }}>Ice Water Calibration (0°C)</Typography>
        <TextField
          required
          fullWidth
          label="Temperature (°C)"
          name="iceWaterTemp"
          type="number"
          value={formData.iceWaterTemp}
          onChange={handleChange}
          sx={{ mb: 3 }}
          disabled={loading}
          inputProps={{ 
            step: "0.1",
            min: "-1",
            max: "1"
          }}
          helperText="Acceptable range: -1°C to 1°C"
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>Boiling Water Calibration (100°C)</Typography>
        <TextField
          required
          fullWidth
          label="Temperature (°C)"
          name="boilingWaterTemp"
          type="number"
          value={formData.boilingWaterTemp}
          onChange={handleChange}
          sx={{ mb: 3 }}
          disabled={loading}
          inputProps={{ 
            step: "0.1",
            min: "99",
            max: "101"
          }}
          helperText="Acceptable range: 99°C to 101°C"
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.isCalibrated}
              onChange={handleChange}
              name="isCalibrated"
              color="primary"
              disabled={loading}
            />
          }
          label="Probe is Calibrated"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Notes (optional)"
          name="notes"
          multiline
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          sx={{ mb: 2 }}
          disabled={loading}
          placeholder="Add any additional notes about the calibration..."
        />

        <Box sx={{ mt: 2, position: 'relative' }}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading}
          >
            Create Calibration Records
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

export default ProbeCalibrationAddPage; 