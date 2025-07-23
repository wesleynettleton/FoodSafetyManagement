import React, { useState, useEffect, useCallback } from 'react';
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
  ImageListItem,
  Pagination,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { auditsAPI } from '../services/api';

const ViewAuditsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Add CSS for spinning animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch audits from API with pagination
  const fetchAudits = useCallback(async (page = 1, forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await auditsAPI.getAll(page, 20);
      const { audits: auditData, pagination: paginationData } = response.data;
      
      // Transform API data to match expected format
      const transformedAudits = auditData.map(audit => ({
        id: audit._id,
        location: audit.location._id,
        locationName: audit.location.name,
        auditor: audit.auditor,
        auditDate: new Date(audit.auditDate).toISOString().split('T')[0],
        status: audit.status,
        score: audit.score !== undefined && audit.score !== null ? audit.score : null,
        totalItems: audit.totalItems || 55,
        compliantItems: audit.compliantItems || 0,
        nonCompliantItems: audit.nonCompliantItems || 0,
        lastUpdated: new Date(audit.updatedAt).toISOString().split('T')[0],
        rawData: audit // Keep original data for detailed view
      }));
      
      setAudits(transformedAudits);
      setPagination(paginationData);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error('Error fetching audits:', err);
      setError(`Failed to load audits: ${err.message}`);
      setAudits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAudits(pagination.currentPage, true);
  };

  useEffect(() => {
    fetchAudits(1);
  }, [fetchAudits]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    fetchAudits(newPage);
  };

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

  // Filter audits based on search term and status
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewAudit = (audit) => {
    setSelectedAudit(audit);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedAudit(null);
  };

  const handleDeleteClick = (audit) => {
    setAuditToDelete(audit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await auditsAPI.delete(auditToDelete.id);
      // Remove the deleted audit from the list
      setAudits(audits.filter(audit => audit.id !== auditToDelete.id));
      setDeleteDialogOpen(false);
      setAuditToDelete(null);
    } catch (error) {
      console.error('Error deleting audit:', error);
      alert('Failed to delete audit. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAuditToDelete(null);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Refresh audits">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              color="primary"
            >
              <RefreshIcon className={refreshing ? 'spin' : ''} />
            </IconButton>
          </Tooltip>
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
      </Box>

      {/* Last updated info */}
      {lastFetchTime && !loading && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Last updated: {lastFetchTime.toLocaleTimeString()}
        </Typography>
      )}

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
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
      {!loading && filteredAudits.length > 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {isAdmin && <TableCell>Location</TableCell>}
                  <TableCell>Auditor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
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
                      {audit.score !== null && audit.score !== undefined ? (
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
                      {isAdmin && (
                        <Tooltip title="Delete Audit">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(audit)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {audit.status === 'completed' && (
                        <Tooltip title="Download Report">
                          <IconButton
                            size="small"
                            onClick={() => alert('Download functionality coming soon')}
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
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Loading skeleton for table */}
      {loading && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {isAdmin && <TableCell>Location</TableCell>}
                  <TableCell>Auditor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    {isAdmin && <TableCell><Skeleton /></TableCell>}
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell align="center"><Skeleton /></TableCell>
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
              onClick={() => alert('Download functionality coming soon')}
            >
              Download Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the audit for {auditToDelete?.locationName} conducted by {auditToDelete?.auditor} on {auditToDelete?.auditDate ? new Date(auditToDelete.auditDate).toLocaleDateString() : 'unknown date'}?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default ViewAuditsPage; 