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
        
        const response = await fetch(`http://localhost:5001/api/audits/${auditId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch audit');
        }

        const audit = await response.json();
        
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

  const auditSections = [
    {
      id: 'foodSafetyHygiene',
      title: 'Food Safety & Hygiene Procedures',
      items: [
        'Are staff wearing clean protective clothing including drivers? Are staff fit to work? Is long hair tied back or covered? Are there rules in place for wearing jewellery, nail varnish etc.?',
        'Are cooked/ready to eat foods stored separately or above raw foods e.g. raw meat, vegetables, shell eggs?',
        'Are raw and cooked/ready to eat foods kept separate during preparation? Are separate areas provided?',
        // ... other items would be here in real implementation
      ]
    },
    // ... other sections would be here
  ];

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
              const isCompliant = auditData[section.id]?.[`item_${itemIndex}_checked`];
              const notes = auditData[section.id]?.[`item_${itemIndex}_notes`];
              const photos = auditData[section.id]?.[`item_${itemIndex}_photos`] || [];

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
                        <Typography variant="body2">
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