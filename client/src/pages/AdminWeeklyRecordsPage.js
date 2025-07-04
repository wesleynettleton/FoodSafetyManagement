import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  IconButton,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as WeeklyIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { recordsAPI, locationsAPI } from '../services/api';

const AdminWeeklyRecordsPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchRecords();
    }
  }, [selectedLocation]);

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

  const fetchRecords = async () => {
    if (!selectedLocation) return;
    
    try {
      setLoading(true);
      // Use the admin endpoint to get records for a specific location
      const response = await recordsAPI.getRecordsByTypeAndLocation('weekly-record', selectedLocation);
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch weekly records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedRecord(null);
  };

  const checklistSections = [
    { title: "Training", items: ["New Staff including Induction", "Formal Training", "Retraining/HACCP Training", "Other Training"] },
    { title: "Personal Hygiene", items: ["Personal Cleanliness/Hand Washing Facilities", "Protective Clothing", "Illness/Exclusion"] },
    { title: "Cleaning", items: ["All specified equipment and areas", "Frequency", "Method"] },
    { title: "Cross Contamination Prevention", items: ["Personnel", "Delivery Vehicles", "Storage", "Cooling", "Equipment", "Allergy Awareness"] },
    { title: "Pest Control", items: ["Pest Proofing", "Good Housekeeping"] },
    { title: "Waste Control", items: ["Waste in Food Rooms", "Waste Collection"] },
    { title: "Maintenance", items: ["Delivery Vehicles", "Premises Structure", "Light Fittings/Covers", "Work Surfaces", "Equipment/Utensils", "Ventilation System"] },
    { title: "Stock Control", items: ["Delivery", "Storage", "Stock Rotation", "Labelling", "Protection of Food"] },
    { title: "Temperature Control", items: [] },
    { title: "Records", items: [] }
  ];

  const getStatusChip = (record) => {
    const checklistData = record.checklistData || {};
    const hasIssues = Object.values(checklistData).some(value => value === 'no');
    
    if (hasIssues) {
      return <Chip label="Issues Found" color="error" size="small" />;
    }
    return <Chip label="All Clear" color="success" size="small" />;
  };

  const renderChecklistData = (record) => {
    const checklistData = record.checklistData || {};
    
    return checklistSections.map((section, sectionIndex) => (
      <Accordion key={sectionIndex}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {section.title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {section.items.length > 0 ? (
            section.items.map((item, itemIndex) => {
              const value = checklistData[`${sectionIndex}-${itemIndex}`] || 'N/A';
              const color = value === 'yes' ? 'success' : value === 'no' ? 'error' : 'default';
              return (
                <Box key={itemIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">• {item}</Typography>
                  <Chip label={value.toUpperCase()} color={color} size="small" />
                </Box>
              );
            })
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Overall compliance</Typography>
              <Chip 
                label={(checklistData[`${sectionIndex}-main`] || 'N/A').toUpperCase()} 
                color={checklistData[`${sectionIndex}-main`] === 'yes' ? 'success' : checklistData[`${sectionIndex}-main`] === 'no' ? 'error' : 'default'} 
                size="small" 
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    ));
  };

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc._id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  if (loading && locations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <WeeklyIcon sx={{ mr: 1, color: 'secondary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Admin - Weekly Records
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
            Viewing weekly records for: <strong>{getLocationName(selectedLocation)}</strong>
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'secondary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'secondary.contrastText' }}>Week Commencing</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'secondary.contrastText' }}>Manager</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'secondary.contrastText' }}>Created By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'secondary.contrastText' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'secondary.contrastText' }}>Date Completed</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'secondary.contrastText' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No weekly records found for this location.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record._id} hover>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {new Date(record.weekCommencing).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>{record.managerSignature}</TableCell>
                        <TableCell>{record.createdBy?.name || 'Unknown'}</TableCell>
                        <TableCell>{getStatusChip(record)}</TableCell>
                        <TableCell>
                          {new Date(record.signatureDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewRecord(record)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* View Record Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WeeklyIcon sx={{ mr: 1 }} />
            Weekly Record - Week of {selectedRecord && new Date(selectedRecord.weekCommencing).toLocaleDateString('en-GB')}
            <Chip 
              label={getLocationName(selectedRecord?.location)} 
              color="secondary" 
              size="small" 
              sx={{ ml: 2 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Checklist Results
              </Typography>
              {renderChecklistData(selectedRecord)}

              {selectedRecord.correctiveActions && selectedRecord.correctiveActions.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Corrective Actions
                  </Typography>
                  {selectedRecord.correctiveActions.map((action, index) => (
                    action.deviation || action.action ? (
                      <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'warning.lighter' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Deviation Observed:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {action.deviation || 'Not specified'}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Action Taken:
                        </Typography>
                        <Typography variant="body2">
                          {action.action || 'Not specified'}
                        </Typography>
                      </Paper>
                    ) : null
                  ))}
                </Box>
              )}

              {selectedRecord.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Notes
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedRecord.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Box sx={{ mt: 3, p: 2, backgroundColor: 'secondary.lighter' }}>
                <Typography variant="body2">
                  <strong>Manager/Supervisor:</strong> {selectedRecord.managerSignature}
                </Typography>
                <Typography variant="body2">
                  <strong>Created By:</strong> {selectedRecord.createdBy?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2">
                  <strong>Date Signed:</strong> {new Date(selectedRecord.signatureDate).toLocaleDateString('en-GB')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminWeeklyRecordsPage; 