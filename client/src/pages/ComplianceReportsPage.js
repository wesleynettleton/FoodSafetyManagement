import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { analyticsAPI, locationsAPI } from '../services/api';
import { useSelector } from 'react-redux';

const ComplianceReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [reportData, setReportData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
    location: 'all',
    reportType: 'full'
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchLocations();
    }
  }, [isAdmin]);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await analyticsAPI.getComplianceReport(
        formData.startDate,
        formData.endDate,
        formData.location,
        formData.reportType
      );
      
      setReportData(response.data);
    } catch (err) {
      setError('Failed to generate compliance report. Please try again.');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.downloadComplianceReportPDF(
        formData.startDate,
        formData.endDate,
        formData.location
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compliance-report-${formData.startDate}-to-${formData.endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download PDF report. Please try again.');
      console.error('PDF download error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'major':
        return <WarningIcon color="warning" />;
      case 'minor':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'major':
        return 'warning';
      case 'minor':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Compliance Reports
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Report Generation Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generate Compliance Report
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {isAdmin && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={formData.location}
                    label="Location"
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  >
                    <MenuItem value="all">All Locations</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location._id} value={location._id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={formData.reportType}
                  label="Report Type"
                  onChange={(e) => handleInputChange('reportType', e.target.value)}
                >
                  <MenuItem value="summary">Summary Only</MenuItem>
                  <MenuItem value="full">Full Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generateReport}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
            >
              Generate Report
            </Button>
            
            {reportData && (
              <Button
                variant="outlined"
                onClick={downloadPDF}
                disabled={loading}
                startIcon={<DownloadIcon />}
              >
                Download PDF
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Executive Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Executive Summary
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {reportData.executiveSummary.totalRecords}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Records
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {reportData.executiveSummary.overallComplianceRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Compliance Rate
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {reportData.executiveSummary.totalViolations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Violations
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {reportData.executiveSummary.criticalViolations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Critical Violations
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Report Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Period: {formatDate(reportData.reportMetadata.reportPeriod.startDate)} - {formatDate(reportData.reportMetadata.reportPeriod.endDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Locations: {reportData.reportMetadata.locations.map(l => l.name).join(', ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Generated by: {reportData.reportMetadata.generatedBy.username} ({reportData.reportMetadata.generatedBy.role})
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Generated: {formatDate(reportData.reportMetadata.generatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Compliance Analysis */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Compliance Analysis by Category
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="center">Total Records</TableCell>
                      <TableCell align="center">Compliant</TableCell>
                      <TableCell align="center">Violations</TableCell>
                      <TableCell align="center">Compliance Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(reportData.complianceAnalysis).map(([category, analysis]) => (
                      <TableRow key={category}>
                        <TableCell>
                          {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </TableCell>
                        <TableCell align="center">{analysis.total}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
                            {analysis.compliant}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ErrorIcon sx={{ color: 'error.main', mr: 1, fontSize: 16 }} />
                            {analysis.violations.length}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${analysis.complianceRate}%`}
                            color={parseFloat(analysis.complianceRate) >= 95 ? 'success' : 
                                   parseFloat(analysis.complianceRate) >= 85 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Violations */}
          {reportData.violations.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Violations Summary
                </Typography>
                
                {reportData.violations.map((violation, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {getSeverityIcon(violation.severity)}
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Typography variant="subtitle2">
                            {violation.category.toUpperCase()} - {violation.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(violation.recordedAt)} • Recorded by: {violation.recordedBy}
                          </Typography>
                        </Box>
                        <Chip
                          label={violation.severity.toUpperCase()}
                          color={getSeverityColor(violation.severity)}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        <strong>Details:</strong>
                      </Typography>
                      {violation.temperature && (
                        <Typography variant="body2">
                          Temperature: {violation.temperature}°C (Expected: {violation.expectedRange})
                        </Typography>
                      )}
                      {violation.deviation && (
                        <Typography variant="body2">
                          Calibration Deviation: {violation.deviation}°C (Tolerance: {violation.tolerance})
                        </Typography>
                      )}
                      {violation.failedItems && (
                        <Typography variant="body2">
                          Failed Checklist Items: {violation.failedItems.join(', ')}
                        </Typography>
                      )}
                      {violation.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Notes:</strong> {violation.notes}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {reportData.recommendations.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                
                <List>
                  {reportData.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InfoIcon color={rec.priority === 'high' ? 'error' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={rec.description}
                        secondary={`Action: ${rec.action}`}
                      />
                      <Chip
                        label={rec.priority.toUpperCase()}
                        color={rec.priority === 'high' ? 'error' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default ComplianceReportsPage; 