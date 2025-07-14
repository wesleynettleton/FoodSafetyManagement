import React, { useState } from 'react';
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

  // Mock audit data - in real app, would fetch by auditId from API
  const auditData = {
    id: auditId,
    location: user?.role === 'admin' ? 'location_id_1' : user?.siteLocation?._id || user?.siteLocation || 'location_id_1',
    locationName: user?.role === 'admin' ? 'Main Kitchen - St. Mary\'s Primary' : user?.siteLocation?.name || user?.location || 'Your Kitchen',
    auditor: 'John Smith',
    auditDate: '2024-01-15',
    status: 'completed',
    score: 95,
    // Sample data structure with photos for demonstration
    foodSafetyHygiene: {
      item_0_checked: true,
      item_0_notes: 'All staff properly equipped with clean uniforms and protective gear.',
      item_0_photos: [
        {
          id: 1,
          name: 'staff_uniforms.jpg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          timestamp: '2024-01-15T10:30:00.000Z'
        }
      ],
      item_1_checked: false,
      item_1_notes: 'Found cooked chicken stored below raw beef in walk-in cooler. Immediate correction required.',
      item_1_photos: [
        {
          id: 2,
          name: 'food_storage_issue.jpg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          timestamp: '2024-01-15T10:35:00.000Z'
        }
      ]
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
    </Container>
  );
};

export default AuditDetailsPage; 