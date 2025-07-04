import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { recordsAPI, locationsAPI } from '../services/api';
import { TemperatureCell } from '../utils/temperatureUtils';

const DeliveryListPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchDeliveryRecords = useCallback(async (locationId = null) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (user?.role === 'admin' && locationId) {
        response = await recordsAPI.getRecordsByTypeAndLocation('delivery', locationId);
      } else if (user?.role !== 'admin') {
        response = await recordsAPI.getDeliveries(); // Assumes recordsAPI.getDeliveries() exists
      } else {
        setRecords([]);
        setLoading(false);
        return;
      }
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch delivery records. Please try again.');
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setError, setRecords]);

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoadingLocations(true);
      locationsAPI.getAll()
        .then(response => {
          setLocations(response.data);
          setLoadingLocations(false);
        })
        .catch(err => {
          setError('Failed to fetch locations.');
          console.error(err);
          setLoadingLocations(false);
          setLoading(false);
        });
    } else {
      fetchDeliveryRecords();
    }
  }, [user, fetchDeliveryRecords]);

  useEffect(() => {
    if (user?.role === 'admin' && selectedLocation) {
      fetchDeliveryRecords(selectedLocation);
    } else if (user?.role === 'admin' && !selectedLocation && locations.length > 0) {
      setRecords([]);
      setLoading(false); 
    }
  }, [user, selectedLocation, locations, fetchDeliveryRecords]);
  
  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  if (user?.role === 'admin' && loadingLocations) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading locations...</Typography>
      </Container>
    );
  }

  // Placeholder for table columns - adjust based on Delivery model
  const tableHeaders = ['Supplier', 'Temperature (°C)', 'Notes', 'Recorded By', 'Date'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Delivery Records
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
        {user?.role !== 'admin' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/records/delivery/add')}
          >
            Add New Record
          </Button>
        )}
        </Box>
      </Box>

      {user?.role === 'admin' && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="location-select-label">Select Location</InputLabel>
          <Select
            labelId="location-select-label"
            id="location-select"
            value={selectedLocation}
            label="Select Location"
            onChange={handleLocationChange}
            disabled={locations.length === 0 || loadingLocations}
          >
            {locations.map((loc) => (
              <MenuItem key={loc._id} value={loc._id}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : (user?.role !== 'admin' && records.length === 0 && !error) ? (
        <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 2 }}>
          No delivery records found for your location.
        </Typography>
      ) : (user?.role === 'admin' && !selectedLocation && locations.length > 0 && !error) ? (
         <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 2 }}>
          Please select a location to view records.
        </Typography>
      ) : (records.length === 0 && !error) ? (
         <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 2 }}>
          No delivery records found for the selected criteria.
        </Typography>
      ) : (records.length > 0 && !error) ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                {tableHeaders.map(header => <TableCell key={header}>{header}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell>{record.supplier}</TableCell>
                  <TableCell>
                    <TemperatureCell record={record} />
                  </TableCell>
                  <TableCell>{record.notes}</TableCell>
                  <TableCell>{record.createdBy?.name || 'N/A'}</TableCell> 
                  <TableCell>{new Date(record.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null }
    </Container>
  );
};

export default DeliveryListPage; 