import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { recordsAPI } from '../services/api';

const CoolingTemperatureListPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await recordsAPI.getCoolingTemperatures();
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch cooling temperature records');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/records')} sx={{ mr: 1 }}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
    </Container>
  );
};

export default CoolingTemperatureListPage; 