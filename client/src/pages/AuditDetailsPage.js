import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Card,
  CardContent,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  Alert,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { auditsAPI } from '../services/api';

const AuditDetailsPage = () => {
  const navigate = useNavigate();
  const { auditId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch audit data by ID from API
  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await auditsAPI.getById(auditId);
        const audit = response.data;
        
        // Transform API data to match expected format
        const transformedData = {
          id: audit._id,
          location: audit.location._id,
          locationName: audit.location.name,
          auditor: audit.auditor,
          auditDate: new Date(audit.auditDate).toISOString().split('T')[0],
          status: audit.status,
          score: audit.score || 0,
          totalItems: audit.totalItems || 55,
          compliantItems: audit.compliantItems || 0,
          nonCompliantItems: audit.nonCompliantItems || 0,
          rawData: audit, // Keep original data for accessing sections
          ...audit.sections.reduce((acc, section) => {
            const sectionData = {};
            section.items.forEach((item, index) => {
              if (item.checked !== undefined) {
                sectionData[`item_${index}_checked`] = item.checked;
              }
              if (item.notes) {
                sectionData[`item_${index}_notes`] = item.notes;
              }
              if (item.photos && item.photos.length > 0) {
                sectionData[`item_${index}_photos`] = item.photos;
              }
            });
            acc[section.sectionId] = sectionData;
            return acc;
          }, {})
        };
        
        setAuditData(transformedData);
      } catch (err) {
        setError(`Failed to load audit: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (auditId) {
      fetchAudit();
    }
  }, [auditId]);

  // Static audit sections template (same as TakeAuditPage)
  const auditSectionsTemplate = [
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

  // Combine template with actual audit data to show user responses
  const auditSections = auditSectionsTemplate.map(section => ({
    ...section,
    userResponses: auditData?.[section.id] || {} // Get user responses for this section
  }));

  const handlePhotoView = (photo) => {
    setSelectedPhoto(photo);
    setPhotoViewerOpen(true);
  };

  const handleClosePhotoViewer = () => {
    setPhotoViewerOpen(false);
    setSelectedPhoto(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading audit details...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {!loading && !error && auditData && (
        <>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => navigate('/admin/audits/view')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                Audit Details - {auditData.locationName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Conducted by {auditData.auditor} on {new Date(auditData.auditDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

      {/* Audit Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" color="primary">
              Score: {auditData.score}%
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Chip
              label={auditData.status.charAt(0).toUpperCase() + auditData.status.slice(1)}
              color="success"
              size="medium"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Status: Audit completed and results available for review
            </Typography>
          </Grid>
        </Grid>
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
            {section.items.map((item, itemIndex) => {
              const isCompliant = section.userResponses[`item_${itemIndex}_checked`];
              const notes = section.userResponses[`item_${itemIndex}_notes`];
              const photos = section.userResponses[`item_${itemIndex}_photos`] || [];

              return (
                <Card key={itemIndex} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="body2" sx={{ mr: 2, minWidth: '20px', fontWeight: 'bold' }}>
                        {itemIndex + 1}.
                      </Typography>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {item}
                      </Typography>
                      {/* Compliance Status */}
                      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                        {isCompliant ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Compliant"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<CancelIcon />}
                            label="Non-Compliant"
                            color="error"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Notes */}
                    {notes && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Inspector Notes:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {notes}
                        </Typography>
                      </Box>
                    )}

                    {/* Photo Indicators */}
                    {photos.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Photo Evidence ({photos.length} photo{photos.length > 1 ? 's' : ''}):
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {photos.map((photo) => (
                            <Grid item key={photo.id}>
                              <Badge
                                badgeContent={<PhotoCameraIcon sx={{ fontSize: 12 }} />}
                                color="primary"
                              >
                                <Avatar
                                  src={photo.data}
                                  variant="rounded"
                                  sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 }
                                  }}
                                  onClick={() => handlePhotoView(photo)}
                                />
                              </Badge>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Photo Viewer Modal */}
      <Dialog
        open={photoViewerOpen}
        onClose={handleClosePhotoViewer}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Photo Evidence
            </Typography>
            <IconButton onClick={handleClosePhotoViewer}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPhoto && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={selectedPhoto.data}
                alt={selectedPhoto.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {selectedPhoto.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Uploaded: {new Date(selectedPhoto.timestamp).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoViewer}>Close</Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Container>
  );
};

export default AuditDetailsPage; 