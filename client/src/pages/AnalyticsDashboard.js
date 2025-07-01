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
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Thermostat as ThermostatIcon,
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

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [analytics, setAnalytics] = useState({
    overview: {},
    compliance: [],
    temperatureTrends: [],
    recentAlerts: []
  });

  const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3'];

  useEffect(() => {
    fetchData();
  }, [selectedLocation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLocations(),
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
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Fallback to mock data if API fails
      const mockAnalytics = generateMockAnalytics();
      setAnalytics(mockAnalytics);
    }
  };

  const generateMockAnalytics = () => {
    const locationNames = locations.length > 0 
      ? locations.map(loc => loc.name) 
      : ['Main Kitchen', 'Secondary Kitchen', 'Prep Area', 'Storage'];

    return {
      overview: {
        totalRecords: 1247,
        complianceRate: 94.2,
        criticalAlerts: 3,
        locationsMonitored: locations.length || 4
      },
      compliance: locationNames.map(name => ({
        location: name,
        compliant: Math.floor(Math.random() * 50) + 70,
        nonCompliant: Math.floor(Math.random() * 20) + 5,
        pending: Math.floor(Math.random() * 10) + 2
      })),
      temperatureTrends: [
        { date: '2024-01-01', avgTemp: 3.2, critical: 0 },
        { date: '2024-01-02', avgTemp: 3.5, critical: 1 },
        { date: '2024-01-03', avgTemp: 2.8, critical: 0 },
        { date: '2024-01-04', avgTemp: 3.1, critical: 0 },
        { date: '2024-01-05', avgTemp: 4.2, critical: 2 },
        { date: '2024-01-06', avgTemp: 3.0, critical: 0 },
        { date: '2024-01-07', avgTemp: 3.3, critical: 0 }
      ],
      recentAlerts: [
        {
          id: 1,
          type: 'Temperature',
          message: 'Fridge 2 temperature above 5°C',
          location: 'Main Kitchen',
          severity: 'high',
          time: '2 hours ago'
        },
        {
          id: 2,
          type: 'Compliance',
          message: 'Weekly checklist overdue',
          location: 'Secondary Kitchen',
          severity: 'medium',
          time: '1 day ago'
        },
        {
          id: 3,
          type: 'Equipment',
          message: 'Probe calibration due',
          location: 'Prep Area',
          severity: 'low',
          time: '3 days ago'
        }
      ]
    };
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

      {/* Location Filter */}
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
        <Grid item xs={12} md={8}>
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

        {/* Compliance Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Compliant', value: 89, fill: '#4caf50' },
                      { name: 'Non-Compliant', value: 8, fill: '#f44336' },
                      { name: 'Pending', value: 3, fill: '#ff9800' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.compliance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
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