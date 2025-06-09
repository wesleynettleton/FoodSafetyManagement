import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  IconButton,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { recordsAPI, locationsAPI } from '../services/api';

const CoolingTemperatureListPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchRecords = useCallback(async (locationId = null) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (user?.role === 'admin' && locationId) {
        response = await recordsAPI.getRecordsByTypeAndLocation('cooling-temperature', locationId);
      } else if (user?.role !== 'admin') {
        response = await recordsAPI.getCoolingTemperatures();
      } else {
        setRecords([]);
        setLoading(false);
        return;
      }
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch cooling temperature records. Please try again.');
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
      fetchRecords();
    }
  }, [user, fetchRecords]);

  useEffect(() => {
    if (user?.role === 'admin' && selectedLocation) {
      fetchRecords(selectedLocation);
    } else if (user?.role === 'admin' && !selectedLocation) {
      setRecords([]);
      setLoading(false);
    }
  }, [user, selectedLocation, fetchRecords]);

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const getTemperatureStatus = (temperature) => {
    if (temperature > 8) {
      return {
        status: 'danger',
        icon: <WarningIcon color="error" />,
        tooltip: 'Temperature above 8°C after 2 hours - Requires immediate action'
      };
    }
    return {
      status: 'safe',
      icon: null,
      tooltip: 'Temperature within safe range'
    };
  };

  if (user?.role === 'admin' && loadingLocations) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading locations...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Cooling Temperature Records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/records/cooling-temperature/add')}
        >
          Add Record
        </Button>
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
            disabled={locations.length === 0}
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
      ) : user?.role === 'admin' && !selectedLocation && locations.length > 0 ? (
        <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 2 }}>
          Please select a location to view records.
        </Typography>
      ) : records.length === 0 ? (
        <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 2 }}>
          No cooling temperature records found for the selected criteria.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Food Item</TableCell>
                <TableCell>Cooling Start Time</TableCell>
                <TableCell>Moved to Storage</TableCell>
                <TableCell>90 Min Temp (°C)</TableCell>
                <TableCell>2 Hour Temp (°C)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Corrective Actions</TableCell>
                <TableCell>Recorded By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => {
                const tempStatus = getTemperatureStatus(record.temperatureAfter2Hours);
                return (
                  <TableRow key={record._id}>
                    <TableCell>{record.foodName}</TableCell>
                    <TableCell>
                      {format(new Date(record.coolingStartTime), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.movedToStorageTime), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{record.temperatureAfter90Min}°C</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {record.temperatureAfter2Hours}°C
                        {tempStatus.icon && (
                          <Tooltip title={tempStatus.tooltip}>
                            {tempStatus.icon}
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={tempStatus.status === 'danger' ? 'error' : 'success'}
                      >
                        {tempStatus.status === 'danger' ? 'Requires Action' : 'Safe'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {record.correctiveActions || '-'}
                    </TableCell>
                    <TableCell>{record.createdBy?.name || 'Unknown'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default CoolingTemperatureListPage; 