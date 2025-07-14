import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Badge,
  Avatar,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ViewAuditsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [auditPhotos, setAuditPhotos] = useState({});
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch audits from API
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('http://localhost:5000/api/audits', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch audits');
        }

        const auditData = await response.json();
        console.log('Fetched audits:', auditData);
        
        // Transform API data to match expected format
        const transformedAudits = auditData.map(audit => ({
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
          lastUpdated: new Date(audit.updatedAt).toISOString().split('T')[0],
          sections: audit.sections || {},
          hasPhotos: false, // TODO: Calculate based on audit.sections
          photoCount: 0, // TODO: Calculate based on audit.sections
          rawData: audit // Keep original data for detailed view
        }));
        
        setAudits(transformedAudits);
      } catch (err) {
        console.error('Error fetching audits:', err);
        setError(`Failed to load audits: ${err.message}`);
        setAudits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success.main';
    if (score >= 75) return 'warning.main';
    return 'error.main';
  };

  // Filter audits based on user role and location
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    
    // If user is kitchen staff, only show audits for their location
    const matchesLocation = user?.role === 'admin' || audit.location === user?.siteLocation?._id || audit.location === user?.siteLocation;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleViewAudit = (audit) => {
    setSelectedAudit(audit);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedAudit(null);
  };

  const handlePhotoView = (photo) => {
    setSelectedPhoto(photo);
    setPhotoViewerOpen(true);
  };

  const handleClosePhotoViewer = () => {
    setPhotoViewerOpen(false);
    setSelectedPhoto(null);
  };

  const getPhotoCount = (sectionData) => {
    let totalPhotos = 0;
    Object.keys(sectionData || {}).forEach(key => {
      if (key.includes('_photos') && Array.isArray(sectionData[key])) {
        totalPhotos += sectionData[key].length;
      }
    });
    return totalPhotos;
  };

  const calculateProgress = (audit) => {
    const checkedItems = audit.compliantItems + audit.nonCompliantItems;
    return audit.totalItems > 0 ? (checkedItems / audit.totalItems) * 100 : 0;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(isAdmin ? '/admin/audits' : '/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isAdmin ? 'View Audits' : `Audit Results - ${user?.location || 'Your Location'}`}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/audits/take')}
            size="large"
          >
            New Audit
          </Button>
        )}
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading audits...</Typography>
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && audits.length === 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No audits found. {isAdmin ? 'Create your first audit to get started.' : 'No audits have been conducted for your location yet.'}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {filteredAudits.filter(a => a.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Audits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {filteredAudits.filter(a => a.status === 'in-progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {filteredAudits.filter(a => a.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {filteredAudits.filter(a => a.score >= 90).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Scores (90%+)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={isAdmin ? "Search by location or auditor..." : "Search audits..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* No Audits Message */}
      {filteredAudits.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {isAdmin 
            ? "No audits found. Click 'New Audit' to schedule your first audit."
            : `No audits found for ${user?.location || 'your location'}. Audits will appear here once they are conducted.`
          }
        </Alert>
      )}

      {/* Audits Table */}
      {filteredAudits.length > 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {isAdmin && <TableCell>Location</TableCell>}
                  <TableCell>Auditor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Photos</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id} hover>
                    {isAdmin && (
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {audit.locationName}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>
                      {new Date(audit.auditDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                        color={getStatusColor(audit.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Math.round(calculateProgress(audit))}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {audit.score ? (
                        <Typography
                          variant="body2"
                          color={getScoreColor(audit.score)}
                          fontWeight="bold"
                        >
                          {audit.score}%
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {audit.hasPhotos ? (
                        <Chip
                          icon={<PhotoCameraIcon />}
                          label={`${audit.photoCount || 0} photos`}
                          size="small"
                          color="info"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No photos
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/audits/details/${audit.id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Edit Audit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/audits/edit/${audit.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {audit.status === 'completed' && (
                        <Tooltip title="Download Report">
                          <IconButton
                            size="small"
                            onClick={() => console.log('Download report', audit.id)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Audit Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Audit Details - {selectedAudit?.locationName}
        </DialogTitle>
        <DialogContent>
          {selectedAudit && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Auditor: {selectedAudit.auditor}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(selectedAudit.auditDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status: {selectedAudit.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Score: {selectedAudit.score ? `${selectedAudit.score}%` : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Section Breakdown
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Food Safety & Hygiene Procedures"
                    secondary={`${selectedAudit.sections?.foodSafetyHygiene?.compliant || 0}/${selectedAudit.sections?.foodSafetyHygiene?.total || 14} compliant`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Structural Requirements"
                    secondary={`${selectedAudit.sections?.structuralRequirements?.compliant || 0}/${selectedAudit.sections?.structuralRequirements?.total || 16} compliant`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Vehicles"
                    secondary={`${selectedAudit.sections?.vehicles?.compliant || 0}/${selectedAudit.sections?.vehicles?.total || 2} compliant`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Confidence in Management"
                    secondary={`${selectedAudit.sections?.confidenceInManagement?.compliant || 0}/${selectedAudit.sections?.confidenceInManagement?.total || 15} compliant`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Particulars"
                    secondary={`${selectedAudit.sections?.particulars?.compliant || 0}/${selectedAudit.sections?.particulars?.total || 8} compliant`}
                  />
                </ListItem>
              </List>

              {selectedAudit.nonCompliantIssues?.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom color="error">
                    Non-Compliant Issues
                  </Typography>
                  <List dense>
                    {selectedAudit.nonCompliantIssues.map((issue, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={issue} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedAudit?.status === 'completed' && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => console.log('Download full report')}
            >
              Download Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

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

export default ViewAuditsPage; 