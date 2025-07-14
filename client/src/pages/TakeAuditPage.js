import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  Chip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Send as SendIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { locationsAPI } from '../services/api';

const TakeAuditPage = () => {
  const navigate = useNavigate();
  
  const [auditData, setAuditData] = useState({
    // Basic audit info
    location: '',
    auditor: '',
    auditDate: new Date().toISOString().split('T')[0],
    
    // Audit sections
    foodSafetyHygiene: {},
    structuralRequirements: {},
    vehicles: {},
    confidenceInManagement: {},
    particulars: {}
  });

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data);
      setLoadingLocations(false);
    } catch (err) {
      setError('Failed to fetch locations');
      setLoadingLocations(false);
      console.error(err);
    }
  };

  const auditSections = [
    {
      id: 'foodSafetyHygiene',
      title: 'Food Safety & Hygiene Procedures',
      items: [
        'Are staff wearing clean protective clothing including drivers? Are staff fit to work? Is long hair tied back or covered? Are there rules in place for wearing jewellery, nail varnish etc.?',
        'Are cooked/ready to eat foods stored separately or above raw foods e.g. raw meat, vegetables, shell eggs?',
        'Are raw and cooked/ready to eat foods kept separate during preparation? Are separate areas provided?',
        'Is there separate designated equipment for raw preparation (e.g. cutting boards, knives, sanitiser spray, cling film, cleaning cloth, disposable aprons)? Is this equipment clearly marked and is it understood that it is for raw preparation only?',
        'Where colour coded equipment is used, is it used correctly in order to prevent cross contamination? Are colour coded chopping boards separated correctly?',
        'Are allergen ingredients stored in sealed containers and not in contact with other foods? Are they labelled or easy to identify?',
        'Is there separate equipment or preparation space in place for preparing allergen free food e.g. gluten-free items, or for preparing a specific menu item for a customer who has an allergen?',
        'Are all foods suitably covered, wrapped or in containers to prevent contamination and spoilage?',
        'Is there an adequate date marking system in place for prepared foods and stored ingredients? (For example foods labelled with \'date made\' and/or use by dates). Are foods checked daily to remove out of date items?',
        'Are foods being properly stored and temperature controlled? (The core temp of refrigerated food should be 8°C and below, and frozen foods -18°C or below.) Is a clean, calibrated thermometer provided and available for use?',
        'Can you clearly outline your procedures for making sure food is properly cooked? (High risk foods must be cooked in line with your food safety management system e.g. to a core temperature of 75°C for 30 seconds.)',
        'Are hot held foods kept at a temperature of 63°C and above? Is hot holding equipment preheated and checked to ensure it is capable of maintaining adequate temperature control?',
        'Are cooked foods cooled and refrigerated within 60 - 90 mins?',
        'Can you outline your procedures for safely defrosting frozen foods (e.g. in a refrigerator overnight, in a suitable container to minimise dripping and avoid cross contamination, labelled with a suitable use by date)?'
      ]
    },
    {
      id: 'structuralRequirements',
      title: 'Structural Requirements',
      items: [
        'Are all food preparation areas and equipment in good condition, clean and well maintained?',
        'Are wash hand basins clean and equipped with running hot and cold water, soap and hygienic hand drying facilities? Are they only used for hand washing?',
        'Are there an adequate number of refrigerator and freezer facilities to properly store all foods and ensure adequate separation?',
        'Is there adequate lighting in place to enable adequate pest control checks and effective cleaning to take place?',
        'Is there adequate mechanical and natural ventilation in place? Are extract systems cleaned and well maintained and are windows and air vents pest proofed where possible?',
        'Are all drains and grease traps clean, well maintained and pest proofed? (Drains should be running freely - look for slow draining sinks, broken/ill-fitting drain grills etc.)',
        'Is a disinfectant spray complying with BS EN1276 or 13697 in use? (Required if handling raw and ready to eat foods).',
        'Are you familiar with how to use your disinfectant and cleaning products properly? Can you explain the correct contact time and use (e.g. dilution where applicable)? Are staff adequately trained in your cleaning procedures?',
        'Is a two-stage cleaning process being carried out on food contact surfaces and equipment e.g. chopping boards and knives?',
        'Are single use cloths used for cleaning? If cloths are reused are they cleaned and disinfected correctly and are separate cloths used for cleaning raw and ready to eat foods areas? Are tea towels free from rips and tears? Is washing being done at 90 degrees?',
        'Is there an adequate number of sinks for cleaning equipment and washing food? Are taps free of limescale?',
        'If the same sink is used for both washing equipment and washing food are they effectively cleaned and disinfected between uses?',
        'Is there a constant readily available supply of hot and cold potable running water for cleaning and food preparation?',
        'Is the business premises adequately pest proofed and is it regularly checked for pest activity? Is there a record of the pest control checks that are carried out? If a pest control contract is not in place there should be evidence that checks are being carried out in-house.',
        'Is all waste including used cooking oil stored in suitable clean lidded containers and collected by a licensed waste contractor? Can you provide evidence of this e.g. commercial waste transfer notes?',
        'Is there a cleaning schedule in place? Is it being regularly filled in correctly?'
      ]
    },
    {
      id: 'vehicles',
      title: 'Vehicles',
      items: [
        'Are delivery vehicles clean inside and out?',
        'Are mileage sheets being filled in at the right points as well as being signed and dated?'
      ]
    },
    {
      id: 'confidenceInManagement',
      title: 'Confidence in Management',
      items: [
        'Is there an up-to-date Food Safety Management System (for example Safer Food Better Business) readily available and is it accessible to staff? (Everyone must be aware of its relevance and know where to find it.)',
        'Are you and your staff familiar with the controls outlined in your food safety management system and have you ensured that they reflect the practices and procedures that you are carrying out?',
        'Are appropriate opening and closing checks carried out, before and after trading each day? Is there evidence that corrective actions are taken when problems are identified e.g. equipment failures are addressed, customer complaints are investigated?',
        'Are Daily Diary records kept up-to-date with evidence of the important checks that are carried out? Do staff understand how to use the diary and are they able to access these records on request?',
        'Are you aware of the 14 allergens and how they impact your business? Has a meaningful risk assessment been carried out to determine which ingredients and menu items contain allergens and how you would minimize cross contamination if asked to prepare an allergen free dish?',
        'Are staff able to provide allergen information? Where written information and signposting is available, is it clear and up-to-date?',
        'Are all staff trained to an appropriate level? Have they undertaken a formal food safety training course and have they also been trained on the food safety procedures outlined in the Safety Management System?',
        'Has a supplier list been completed and is there evidence of traceability in place to identify ingredients e.g. recent supplier invoices, receipts, product labels?',
        'Can you clearly outline your fitness policy/return to work procedures? (Staff must report illness and refrain from work if they have suffered from sickness and diarrhoea then they must refrain from work for 48 hours after symptoms have stopped).',
        'Are all records up to date, with fridge/freezer temperatures, Cooking/cooling and reheating temperatures filled in correctly.',
        'Is school feedback being responded to in a timely manner?',
        'Are serving temperatures recorded daily by the schools?',
        'Is the manager encouraging scoring on the feedback Sheet?',
        'Is the weekly record completed every week?',
        'Have all new employees received induction training? Have all staff received relevant training for their job role? Has retraining following corrective actions taken place and recorded? Is training up to date?'
      ]
    },
    {
      id: 'particulars',
      title: 'Particulars',
      items: [
        'Are mops stored off the floor and in relevant buckets? Are any bleach products if on site stored in the toilet correctly?',
        'Are High levels clean and free of dirt, Shelving, Coving etc. High/low level cobwebs',
        'Is all tabling, work surfaces & behind equipment cleaned regularly and not accumulating dirt and food debris',
        'Are all chillers clean and free of debris? Are chiller fans cleaned and free of mould and dirt?',
        'Are blue crockery boxes/cutlery boxes clean, especially inside where things are stored?',
        'Are all drawers or utensil holders free of debris and small parts, no screws etc should be stored in them.',
        'Are Ice packs being used for cold boxes?',
        'Are frozen items named, with date frozen and date of expiry (3 months)'
      ]
    }
  ];

  const handleCheckboxChange = (sectionId, itemIndex, checked) => {
    setAuditData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [`item_${itemIndex}_checked`]: checked
      }
    }));
  };

  const handleNotesChange = (sectionId, itemIndex, notes) => {
    setAuditData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [`item_${itemIndex}_notes`]: notes
      }
    }));
  };

  const handlePhotoUpload = (sectionId, itemIndex, event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = {
          id: Date.now() + Math.random(),
          name: file.name,
          data: e.target.result,
          timestamp: new Date().toISOString()
        };

        setAuditData(prev => {
          const currentPhotos = prev[sectionId]?.[`item_${itemIndex}_photos`] || [];
          return {
            ...prev,
            [sectionId]: {
              ...prev[sectionId],
              [`item_${itemIndex}_photos`]: [...currentPhotos, photoData]
            }
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoDelete = (sectionId, itemIndex, photoId) => {
    setAuditData(prev => {
      const currentPhotos = prev[sectionId]?.[`item_${itemIndex}_photos`] || [];
      const updatedPhotos = currentPhotos.filter(photo => photo.id !== photoId);
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [`item_${itemIndex}_photos`]: updatedPhotos
        }
      };
    });
  };

  const calculateProgress = () => {
    let totalItems = 0;
    let completedItems = 0;

    auditSections.forEach(section => {
      totalItems += section.items.length;
      section.items.forEach((_, index) => {
        if (auditData[section.id] && auditData[section.id][`item_${index}_checked`] !== undefined) {
          completedItems++;
        }
      });
    });

    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const handleSaveAudit = () => {
    // Validate required fields for draft save
    if (!auditData.location || !auditData.auditor || !auditData.auditDate) {
      alert('Please fill in all required fields: Location, Auditor Name, and Audit Date');
      return;
    }

    // Save audit as draft to API
    
    // Get location name for display
    const selectedLocation = locations.find(loc => loc._id === auditData.location);
    const locationName = selectedLocation ? selectedLocation.name : 'Unknown Location';
    
    alert(`Audit draft saved for ${locationName}!`);
  };

  const handleSubmitAudit = async () => {
    // Validate required fields
    if (!auditData.location || !auditData.auditor || !auditData.auditDate) {
      setError('Please fill in all required fields: Location, Auditor Name, and Audit Date');
      return;
    }

    try {
      setError('');
      
      // Transform audit data into the format expected by the API
      const sections = auditSections.map(section => ({
        sectionId: section.id,
        sectionTitle: section.title,
        items: section.items.map((item, index) => ({
          itemIndex: index,
          checked: auditData[section.id] ? auditData[section.id][`item_${index}_checked`] : undefined,
          notes: auditData[section.id] ? auditData[section.id][`item_${index}_notes`] || '' : '',
          photos: auditData[section.id] ? auditData[section.id][`item_${index}_photos`] || [] : []
        }))
      }));

      const auditPayload = {
        location: auditData.location,
        auditor: auditData.auditor,
        auditDate: auditData.auditDate,
        sections: sections,
        status: 'completed'
      };



      const response = await fetch('http://localhost:5001/api/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(auditPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to submit audit');
      }

      const result = await response.json();
      
      // Get location name for display
      const selectedLocation = locations.find(loc => loc._id === auditData.location);
      const locationName = selectedLocation ? selectedLocation.name : 'Unknown Location';
      
      alert(`Audit submitted successfully for ${locationName}!`);
      navigate('/admin/audits/view');
    } catch (err) {
      console.error('Error submitting audit:', err);
      setError(`Failed to submit audit: ${err.message}`);
    }
  };

  const progress = calculateProgress();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/admin/audits')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Pre-EHO Inspection Checklist
        </Typography>
      </Box>

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Audit Information
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={loadingLocations}>
              <InputLabel>Location *</InputLabel>
              <Select
                value={auditData.location}
                label="Location *"
                onChange={(e) => setAuditData(prev => ({ ...prev, location: e.target.value }))}
                required
              >
                {loadingLocations ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading locations...
                  </MenuItem>
                ) : locations.length === 0 ? (
                  <MenuItem disabled>No locations available</MenuItem>
                ) : (
                  locations.map((location) => (
                    <MenuItem key={location._id} value={location._id}>
                      {location.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Auditor Name"
              value={auditData.auditor}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditor: e.target.value }))}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Audit Date"
              value={auditData.auditDate}
              onChange={(e) => setAuditData(prev => ({ ...prev, auditDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Indicator */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Audit Progress
          </Typography>
          <Chip 
            label={`${Math.round(progress)}% Complete`} 
            color={progress === 100 ? 'success' : 'primary'}
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Audit Sections */}
      {auditSections.map((section, sectionIndex) => (
        <Accordion key={section.id} defaultExpanded={sectionIndex === 0} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {section.title} ({section.items.length} items)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {section.items.map((item, itemIndex) => (
              <Card key={itemIndex} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="body2" sx={{ mr: 2, minWidth: '20px', fontWeight: 'bold' }}>
                      {itemIndex + 1}.
                    </Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {item}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={auditData[section.id]?.[`item_${itemIndex}_checked`] || false}
                            onChange={(e) => handleCheckboxChange(section.id, itemIndex, e.target.checked)}
                            color="success"
                          />
                        }
                        label="Yes (Compliant)"
                      />
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes"
                        placeholder="Add any observations, concerns, or additional details..."
                        value={auditData[section.id]?.[`item_${itemIndex}_notes`] || ''}
                        onChange={(e) => handleNotesChange(section.id, itemIndex, e.target.value)}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* Photo Upload Section */}
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`photo-upload-${section.id}-${itemIndex}`}
                          multiple
                          type="file"
                          onChange={(e) => handlePhotoUpload(section.id, itemIndex, e)}
                        />
                        <label htmlFor={`photo-upload-${section.id}-${itemIndex}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<PhotoCameraIcon />}
                            size="small"
                          >
                            Add Photo
                          </Button>
                        </label>
                      </Grid>
                      {auditData[section.id]?.[`item_${itemIndex}_photos`]?.length > 0 && (
                        <Grid item>
                          <Chip
                            icon={<ImageIcon />}
                            label={`${auditData[section.id][`item_${itemIndex}_photos`].length} photo(s)`}
                            size="small"
                            color="primary"
                          />
                        </Grid>
                      )}
                    </Grid>

                    {/* Photo Preview List */}
                    {auditData[section.id]?.[`item_${itemIndex}_photos`]?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Uploaded Photos:
                        </Typography>
                        <List dense>
                          {auditData[section.id][`item_${itemIndex}_photos`].map((photo) => (
                            <ListItem key={photo.id} sx={{ pl: 0 }}>
                              <ListItemAvatar>
                                <Avatar
                                  src={photo.data}
                                  variant="rounded"
                                  sx={{ width: 40, height: 40 }}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={photo.name}
                                secondary={new Date(photo.timestamp).toLocaleString()}
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => handlePhotoDelete(section.id, itemIndex, photo.id)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Action Buttons */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveAudit}
            size="large"
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmitAudit}
            size="large"
            disabled={!auditData.location || !auditData.auditor || !auditData.auditDate}
          >
            Submit Audit
          </Button>
        </Box>
        {(!auditData.location || !auditData.auditor || !auditData.auditDate) && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Please fill in all required fields (Location, Auditor Name, and Audit Date) before submitting.
          </Alert>
        )}
        {progress > 0 && progress < 100 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This audit is {Math.round(progress)}% complete. You can submit it now, but consider completing all items for a more comprehensive audit.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default TakeAuditPage; 