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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { recordsAPI, locationsAPI, analyticsAPI } from '../services/api';
import { useSelector } from 'react-redux';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [userLocationName, setUserLocationName] = useState('');
  const [analytics, setAnalytics] = useState({
    overview: {},
    compliance: [],
    temperatureTrends: [],
    recentAlerts: []
  });

  const isAdmin = user?.role === 'admin';

  const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3'];

  useEffect(() => {
    fetchData();
  }, [selectedLocation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        isAdmin ? fetchLocations() : Promise.resolve(),
        fetchAnalyticsData()
      ]);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await analyticsAPI.getAnalytics(selectedLocation);
      setAnalytics(response.data);
      
      // For kitchen users, get the location name from the analytics compliance data
      if (!isAdmin && response.data?.compliance && response.data.compliance.length > 0) {
        setUserLocationName(response.data.compliance[0].location);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics data. Please check your connection.');
    }
  };



  const getLocationName = (locationId) => {
    if (locationId === 'all') return 'All Locations';
    const location = locations.find(loc => loc._id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Analytics Dashboard
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Location Filter - Only show for admin users */}
      {isAdmin && (
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Location</InputLabel>
            <Select
              value={selectedLocation}
              label="Location"
              onChange={(e) => setSelectedLocation(e.target.value)}
              startAdornment={<LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location._id} value={location._id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Show location info for kitchen users */}
      {!isAdmin && userLocationName && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Viewing analytics for: <strong>{userLocationName}</strong>
          </Typography>
        </Box>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Records
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.overview.totalRecords?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Compliance Rate
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {analytics.overview.complianceRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Critical Alerts
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {analytics.overview.criticalAlerts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Locations
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.overview.locationsMonitored}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Compliance by Location */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Compliance by Location
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.compliance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compliant" fill="#4caf50" name="Compliant" />
                  <Bar dataKey="nonCompliant" fill="#f44336" name="Non-Compliant" />
                  <Bar dataKey="pending" fill="#ff9800" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Temperature Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Temperature Trends (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.temperatureTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgTemp" 
                    stroke="#2196f3" 
                    name="Average Temperature (°C)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="critical" 
                    stroke="#f44336" 
                    name="Critical Readings"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Alerts & Issues
              </Typography>
              {analytics.recentAlerts.map((alert) => (
                <Paper 
                  key={alert.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderLeft: `4px solid`,
                    borderLeftColor: alert.severity === 'high' ? 'error.main' : 
                                   alert.severity === 'medium' ? 'warning.main' : 'info.main'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {alert.message}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.location} • {alert.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={alert.type} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={alert.severity.toUpperCase()} 
                        size="small" 
                        color={getSeverityColor(alert.severity)}
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsDashboard; 