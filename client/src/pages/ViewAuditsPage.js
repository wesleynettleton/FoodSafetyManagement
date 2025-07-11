import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';

const ViewAuditsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Mock audit data - in real app, this would come from API
  const [audits] = useState([
    {
      id: 1,
      location: 'Main Kitchen - St. Mary\'s Primary',
      auditor: 'John Smith',
      auditDate: '2024-01-15',
      status: 'completed',
      score: 95,
      totalItems: 55,
      compliantItems: 52,
      nonCompliantItems: 3,
      lastUpdated: '2024-01-15',
      sections: {
        foodSafetyHygiene: { compliant: 13, total: 14 },
        structuralRequirements: { compliant: 15, total: 16 },
        vehicles: { compliant: 2, total: 2 },
        confidenceInManagement: { compliant: 14, total: 15 },
        particulars: { compliant: 8, total: 8 }
      },
      nonCompliantIssues: [
        'Staff jewellery policy needs clarification',
        'One freezer temperature slightly above -18°C',
        'Training records need updating for 2 staff members'
      ]
    },
    {
      id: 2,
      location: 'Satellite Kitchen - Oak Tree School',
      auditor: 'Sarah Johnson',
      auditDate: '2024-01-20',
      status: 'in-progress',
      score: null,
      totalItems: 55,
      compliantItems: 32,
      nonCompliantItems: 0,
      lastUpdated: '2024-01-18',
      sections: {
        foodSafetyHygiene: { compliant: 14, total: 14 },
        structuralRequirements: { compliant: 12, total: 16 },
        vehicles: { compliant: 2, total: 2 },
        confidenceInManagement: { compliant: 4, total: 15 },
        particulars: { compliant: 0, total: 8 }
      },
      nonCompliantIssues: []
    },
    {
      id: 3,
      location: 'Central Prep Kitchen',
      auditor: 'Mike Davis',
      auditDate: '2024-01-25',
      status: 'scheduled',
      score: null,
      totalItems: 55,
      compliantItems: 0,
      nonCompliantItems: 0,
      lastUpdated: '2024-01-10',
      sections: {
        foodSafetyHygiene: { compliant: 0, total: 14 },
        structuralRequirements: { compliant: 0, total: 16 },
        vehicles: { compliant: 0, total: 2 },
        confidenceInManagement: { compliant: 0, total: 15 },
        particulars: { compliant: 0, total: 8 }
      },
      nonCompliantIssues: []
    }
  ]);

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

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const calculateProgress = (audit) => {
    const checkedItems = audit.compliantItems + audit.nonCompliantItems;
    return audit.totalItems > 0 ? (checkedItems / audit.totalItems) * 100 : 0;
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/admin/audits')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              View Audits
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/audits/take')}
            size="large"
          >
            New Audit
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {audits.filter(a => a.status === 'completed').length}
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
                  {audits.filter(a => a.status === 'in-progress').length}
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
                  {audits.filter(a => a.status === 'scheduled').length}
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
                  {audits.filter(a => a.score >= 90).length}
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
                placeholder="Search by location or auditor..."
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

        {/* Audits Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>Auditor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {audit.location}
                      </Typography>
                    </TableCell>
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
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewAudit(audit)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Audit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/audits/edit/${audit.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
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

        {/* Audit Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Audit Details - {selectedAudit?.location}
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
                      secondary={`${selectedAudit.sections.foodSafetyHygiene.compliant}/${selectedAudit.sections.foodSafetyHygiene.total} compliant`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Structural Requirements"
                      secondary={`${selectedAudit.sections.structuralRequirements.compliant}/${selectedAudit.sections.structuralRequirements.total} compliant`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Vehicles"
                      secondary={`${selectedAudit.sections.vehicles.compliant}/${selectedAudit.sections.vehicles.total} compliant`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Confidence in Management"
                      secondary={`${selectedAudit.sections.confidenceInManagement.compliant}/${selectedAudit.sections.confidenceInManagement.total} compliant`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Particulars"
                      secondary={`${selectedAudit.sections.particulars.compliant}/${selectedAudit.sections.particulars.total} compliant`}
                    />
                  </ListItem>
                </List>

                {selectedAudit.nonCompliantIssues.length > 0 && (
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
      </Container>
    </Layout>
  );
};

export default ViewAuditsPage; 