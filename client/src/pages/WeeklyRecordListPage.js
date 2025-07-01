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
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as WeeklyIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { recordsAPI } from '../services/api';

const WeeklyRecordListPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await recordsAPI.getWeeklyRecords();
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

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this weekly record? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await recordsAPI.delete('weekly_record', recordId);
      
      // Remove the record from the local state
      setRecords(records.filter(record => record._id !== recordId));
      
      // Close the dialog if this record was being viewed
      if (selectedRecord && selectedRecord._id === recordId) {
        handleCloseDialog();
      }
      
      // You could add a success message here if desired
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
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
    // Check if any checklist items are marked as 'no'
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

  if (loading) {
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
          Weekly Records
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          View completed weekly safety records for your location.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => navigate('/checklists/weekly')}
        >
          Add New Weekly Record
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Week Commencing</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Manager</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Date Completed</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No weekly records found. Create your first weekly record to get started.
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
                  <TableCell>{getStatusChip(record)}</TableCell>
                  <TableCell>
                    {new Date(record.signatureDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewRecord(record)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteRecord(record._id)}
                        disabled={deleteLoading}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

              <Box sx={{ mt: 3, p: 2, backgroundColor: 'primary.lighter' }}>
                <Typography variant="body2">
                  <strong>Manager/Supervisor:</strong> {selectedRecord.managerSignature}
                </Typography>
                <Typography variant="body2">
                  <strong>Date Signed:</strong> {new Date(selectedRecord.signatureDate).toLocaleDateString('en-GB')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button 
            onClick={() => handleDeleteRecord(selectedRecord._id)}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Record'}
          </Button>
          <Button onClick={handleCloseDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WeeklyRecordListPage; 