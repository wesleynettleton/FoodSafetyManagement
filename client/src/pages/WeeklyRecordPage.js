import React, { useState } from 'react';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as WeeklyIcon
} from '@mui/icons-material';
import { recordsAPI } from '../services/api';

const WeeklyRecordPage = () => {
  const navigate = useNavigate();
  const [weekCommencing, setWeekCommencing] = useState('');
  const [checklistData, setChecklistData] = useState({});
  const [correctiveActions, setCorrectiveActions] = useState([
    { deviation: '', action: '' },
    { deviation: '', action: '' },
    { deviation: '', action: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [managerSignature, setManagerSignature] = useState('');
  const [date, setDate] = useState('');

  const checklistSections = [
    {
      title: "Training",
      question: "Have the Training House Rules been followed?",
      items: [
        "New Staff including Induction",
        "Formal Training", 
        "Retraining/HACCP Training",
        "Other Training"
      ]
    },
    {
      title: "Personal Hygiene",
      question: "Have the Personal Hygiene House Rules been followed?",
      items: [
        "Personal Cleanliness/Hand Washing Facilities",
        "Protective Clothing",
        "Illness/Exclusion"
      ]
    },
    {
      title: "Cleaning",
      question: "Has the Cleaning Schedule been followed?",
      items: [
        "All specified equipment and areas",
        "Frequency",
        "Method"
      ]
    },
    {
      title: "Cross Contamination Prevention",
      question: "Have the Cross Contamination Prevention House Rules been followed?",
      items: [
        "Personnel",
        "Delivery Vehicles",
        "Storage",
        "Cooling",
        "Equipment",
        "Allergy Awareness"
      ]
    },
    {
      title: "Pest Control",
      question: "Have the Pest Control House Rules been followed?",
      items: [
        "Pest Proofing",
        "Good Housekeeping"
      ]
    },
    {
      title: "Waste Control",
      question: "Have the Waste Control House Rules been followed?",
      items: [
        "Waste in Food Rooms",
        "Waste Collection"
      ]
    },
    {
      title: "Maintenance",
      question: "Have the Maintenance House Rules been followed?",
      items: [
        "Delivery Vehicles",
        "Premises Structure",
        "Light Fittings/Covers",
        "Work Surfaces",
        "Equipment/Utensils",
        "Ventilation System"
      ]
    },
    {
      title: "Stock Control",
      question: "Have the Stock Control House Rules been followed?",
      items: [
        "Delivery",
        "Storage",
        "Stock Rotation",
        "Labelling",
        "Protection of Food"
      ]
    },
    {
      title: "Temperature Control",
      question: "Have the Temperature Control House Rules been followed?",
      items: []
    },
    {
      title: "Records",
      question: "Have all necessary Temperature Checks been recorded using the correct recording forms?",
      items: []
    }
  ];

  const handleRadioChange = (sectionIndex, itemIndex, value) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setChecklistData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCorrectiveActionChange = (index, field, value) => {
    const newActions = [...correctiveActions];
    newActions[index][field] = value;
    setCorrectiveActions(newActions);
  };

  const addCorrectiveActionRow = () => {
    setCorrectiveActions([...correctiveActions, { deviation: '', action: '' }]);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        weekCommencing,
        checklistData,
        correctiveActions: correctiveActions.filter(action => 
          action.deviation.trim() || action.action.trim()
        ),
        notes,
        managerSignature,
        signatureDate: date
      };

      await recordsAPI.createWeeklyRecord(submitData);
      alert('Weekly Record submitted successfully!');
      navigate('/checklists');
    } catch (error) {
      console.error('Error submitting weekly record:', error);
      alert('Error submitting weekly record. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <WeeklyIcon sx={{ mr: 1, color: 'secondary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Weekly Record
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          The following ongoing checks should be carried out by the Manager/Supervisor at the end of each working week
        </Alert>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Week Commencing"
              type="date"
              value={weekCommencing}
              onChange={(e) => setWeekCommencing(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Section</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Yes</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>No</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>N/A</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklistSections.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {section.title}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {section.question}
                    </TableCell>
                    <TableCell align="center">
                      {section.items.length === 0 && (
                        <FormControl>
                          <RadioGroup
                            value={checklistData[`${sectionIndex}-main`] || ''}
                            onChange={(e) => handleRadioChange(sectionIndex, 'main', e.target.value)}
                          >
                            <FormControlLabel 
                              value="yes" 
                              control={<Radio />} 
                              label="" 
                              sx={{ m: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {section.items.length === 0 && (
                        <FormControl>
                          <RadioGroup
                            value={checklistData[`${sectionIndex}-main`] || ''}
                            onChange={(e) => handleRadioChange(sectionIndex, 'main', e.target.value)}
                          >
                            <FormControlLabel 
                              value="no" 
                              control={<Radio />} 
                              label="" 
                              sx={{ m: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {section.items.length === 0 && (
                        <FormControl>
                          <RadioGroup
                            value={checklistData[`${sectionIndex}-main`] || ''}
                            onChange={(e) => handleRadioChange(sectionIndex, 'main', e.target.value)}
                          >
                            <FormControlLabel 
                              value="na" 
                              control={<Radio />} 
                              label="" 
                              sx={{ m: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                      )}
                    </TableCell>
                  </TableRow>
                  {section.items.length > 0 && section.items.map((item, itemIndex) => (
                    <TableRow key={itemIndex}>
                      <TableCell sx={{ pl: 4 }}>
                        • {item}
                      </TableCell>
                      <TableCell align="center">
                        <FormControl>
                          <RadioGroup
                            value={checklistData[`${sectionIndex}-${itemIndex}`] || ''}
                            onChange={(e) => handleRadioChange(sectionIndex, itemIndex, e.target.value)}
                          >
                            <FormControlLabel 
                              value="yes" 
                              control={<Radio size="small" />} 
                              label="" 
                              sx={{ m: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <FormControl>
                          <RadioGroup
                            value={checklistData[`${sectionIndex}-${itemIndex}`] || ''}
                            onChange={(e) => handleRadioChange(sectionIndex, itemIndex, e.target.value)}
                          >
                            <FormControlLabel 
                              value="no" 
                              control={<Radio size="small" />} 
                              label="" 
                              sx={{ m: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <FormControl>
                          <RadioGroup
                            value={checklistData[`${sectionIndex}-${itemIndex}`] || ''}
                            onChange={(e) => handleRadioChange(sectionIndex, itemIndex, e.target.value)}
                          >
                            <FormControlLabel 
                              value="na" 
                              control={<Radio size="small" />} 
                              label="" 
                              sx={{ m: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>
            If the answer to any of the above questions is "NO" then enter the corrective action details in the table below.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            CORRECTIVE ACTION
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            This space should be used to record details of any deviations from the House Rules during the week.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
                    House Rules Deviations Observed
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
                    Corrective Actions Taken
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {correctiveActions.map((action, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={action.deviation}
                        onChange={(e) => handleCorrectiveActionChange(index, 'deviation', e.target.value)}
                        placeholder="Describe any deviations observed..."
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={action.action}
                        onChange={(e) => handleCorrectiveActionChange(index, 'action', e.target.value)}
                        placeholder="Describe corrective actions taken..."
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button 
            variant="outlined" 
            onClick={addCorrectiveActionRow}
            sx={{ mt: 2 }}
          >
            Add Another Row
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Manager/Supervisor Signature"
              value={managerSignature}
              onChange={(e) => setManagerSignature(e.target.value)}
              placeholder="Enter your name as signature"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/checklists')}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            size="large"
            disabled={!weekCommencing || !managerSignature || !date}
          >
            Submit Weekly Record
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default WeeklyRecordPage; 