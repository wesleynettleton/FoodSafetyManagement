import React, { useState, useEffect } from 'react';
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
  Grid,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { recordsAPI, equipmentAPI } from '../services/api';
import { useSelector } from 'react-redux';

const EquipmentTemperatureAddPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  // State for storing temperature inputs for each piece of equipment
  // e.g., { equipmentId1: '5', equipmentId2: '-18' }
  const [temperatureInputs, setTemperatureInputs] = useState({});
  const [notesInputs, setNotesInputs] = useState({}); // State for notes
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [allEquipment, setAllEquipment] = useState([]); // Renamed from 'equipment' for clarity
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!user || !user.siteLocation) {
        setError('User location not found. Cannot fetch equipment.');
        setLoadingEquipment(false);
        return;
      }
      try {
        // Assuming equipmentAPI.getAll() can be filtered by location or the backend handles it
        // If not, this needs adjustment or a new API endpoint for location-specific equipment
        const response = await equipmentAPI.getAll(); // This might fetch all equipment globally
        // Filter equipment by user's siteLocation client-side if API doesn't do it
        const locationEquipment = response.data.filter(eq => eq.location === user.siteLocation);
        setAllEquipment(locationEquipment);
        // Initialize temperatureInputs with empty strings for each piece of equipment
        const initialTemps = {};
        const initialNotes = {}; // Initialize notes
        locationEquipment.forEach(eq => {
          initialTemps[eq._id] = '';
          initialNotes[eq._id] = ''; // Initialize notes for each equipment
        });
        setTemperatureInputs(initialTemps);
        setNotesInputs(initialNotes); // Set initial notes
      } catch (err) {
        setError('Failed to fetch equipment list. Please try again.');
        console.error(err);
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();
  }, [user]);

  const handleTemperatureChange = (equipmentId, value) => {
    setTemperatureInputs(prevInputs => ({
      ...prevInputs,
      [equipmentId]: value
    }));
  };

  const handleNotesChange = (equipmentId, value) => { // Handler for notes
    setNotesInputs(prevInputs => ({
      ...prevInputs,
      [equipmentId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const submissions = [];
    for (const equipmentId in temperatureInputs) {
      const tempValue = temperatureInputs[equipmentId];
      const noteValue = notesInputs[equipmentId] || ''; // Get note value

      // Only include if temperature is entered (note is optional)
      if (tempValue.trim() !== '' && !isNaN(parseFloat(tempValue))) {
        const equipmentDetails = allEquipment.find(eq => eq._id === equipmentId);
        if (equipmentDetails) {
          submissions.push({
            equipment: equipmentId,
            temperature: parseFloat(tempValue),
            equipmentType: equipmentDetails.type,
            equipmentName: equipmentDetails.name,
            note: noteValue // Include note in submission data
          });
        }
      }
    }

    if (submissions.length === 0) {
      setError('No valid temperatures entered. Please enter at least one temperature.');
      setLoading(false);
      return;
    }

    const submissionPromises = submissions.map(sub => 
      recordsAPI.createTemperature({
        equipment: sub.equipment,
        temperature: sub.temperature,
        equipmentType: sub.equipmentType,
        note: sub.note // Pass note to API service
      }).then(response => ({ status: 'fulfilled', value: response, name: sub.equipmentName }))
        .catch(error => ({ status: 'rejected', reason: error, name: sub.equipmentName }))
    );

    const results = await Promise.allSettled(submissionPromises);

    let successfulSubmissions = 0;
    let failedSubmissions = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.status === 'fulfilled') { // Check inner promise status
        successfulSubmissions++;
      } else {
        // result.value will contain the {status: 'rejected', reason: error, name: equipmentName} object from our mapping
        const failedName = result.status === 'fulfilled' ? result.value.name : (result.reason?.name || 'Unknown Equipment');
        const errorMessage = result.status === 'fulfilled' ? result.value.reason?.response?.data?.msg || result.value.reason?.message || 'Submission failed' : result.reason?.response?.data?.msg || result.reason?.message || 'Submission failed';
        failedSubmissions.push(`${failedName}: ${errorMessage}`);
      }
    });

    if (successfulSubmissions > 0) {
      setSuccess(`${successfulSubmissions} temperature record(s) added successfully.`);
      // Resetting fields
      const resetTemps = {};
      const resetNotes = {}; // Reset notes inputs
      allEquipment.forEach(eq => {
        resetTemps[eq._id] = '';
        resetNotes[eq._id] = ''; // Reset notes for each equipment
      });
      setTemperatureInputs(resetTemps);
      setNotesInputs(resetNotes); // Reset notes inputs
    }

    if (failedSubmissions.length > 0) {
      setError(`Failed to add ${failedSubmissions.length} record(s): ${failedSubmissions.join('; ')}`);
    }

    setLoading(false);
  };

  if (loadingEquipment) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Log All Equipment Temperatures & Notes
        </Typography>
      </Box>

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

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {allEquipment.length === 0 && !loadingEquipment && (
            <Typography sx={{ textAlign: 'center', mb: 2 }}>
              No equipment found for your location or an error occurred.
            </Typography>
          )}
          {allEquipment.map((item, index) => (
            <React.Fragment key={item._id}>
              <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}> {/* Changed to flex-start */}
                <Grid item xs={12} md={3}> {/* Adjusted grid for name/type */}
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium', mt: 1.5 }}> {/* Added margin top */}
                    {item.name} 
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}> {/* Made type block */}
                      ({item.type})
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}> {/* Adjusted grid for temp */}
                  <TextField
                    fullWidth
                    label="Temperature (°C)"
                    name={`temp-${item._id}`}
                    type="number"
                    value={temperatureInputs[item._id] || ''}
                    onChange={(e) => handleTemperatureChange(item._id, e.target.value)}
                    inputProps={{ step: "0.1" }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}> {/* Adjusted grid for notes */}
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    name={`note-${item._id}`}
                    multiline
                    rows={1} // Start with 1 row, can expand or set fixed like 2
                    value={notesInputs[item._id] || ''}
                    onChange={(e) => handleNotesChange(item._id, e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
              {index < allEquipment.length - 1 && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))}

          {allEquipment.length > 0 && (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || loadingEquipment} // Disable button if equipment is still loading
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit All Records'}
            </Button>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default EquipmentTemperatureAddPage; 