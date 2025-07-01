import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  WbSunny as OpeningIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { locationsAPI } from '../services/api';

const AdminOpeningRecordsPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data);
      if (response.data.length > 0) {
        setSelectedLocation(response.data[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch locations');
      console.error(err);
    }
  };

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc._id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <OpeningIcon sx={{ mr: 1, color: 'warning.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Admin - Opening Checklist Records
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ maxWidth: 300 }}>
          <InputLabel>Select Location</InputLabel>
          <Select
            value={selectedLocation}
            label="Select Location"
            onChange={(e) => setSelectedLocation(e.target.value)}
            startAdornment={<LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            {locations.map((location) => (
              <MenuItem key={location._id} value={location._id}>
                {location.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedLocation && (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Viewing opening checklist records for: <strong>{getLocationName(selectedLocation)}</strong>
          </Typography>

          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <OpeningIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              Opening Checklists Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The opening checklist functionality will be implemented in a future update. 
              This will allow you to view and manage daily opening checklist records from all locations.
            </Typography>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default AdminOpeningRecordsPage; 