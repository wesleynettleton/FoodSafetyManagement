import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box
} from '@mui/material';
import {
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Assignment as RecordsIcon,
  Thermostat as ThermostatIcon,
  Build as BuildIcon,
  LocalShipping as LocalShippingIcon,
  Timer as TimerIcon,
  ChecklistRtl as ChecklistIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  FactCheck as FactCheckIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import Logo from '../components/Logo';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Analytics Dashboard',
      description: 'View compliance rates, trends, and insights across all locations.',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      path: '/admin/analytics',
      buttonText: 'View Analytics',
    },
    {
      title: 'Compliance Reports',
      description: 'Generate detailed compliance reports for inspections and audits.',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/compliance-reports',
      buttonText: 'Generate Reports',
    },
    {
      title: 'Audits',
      description: 'Schedule, conduct, and manage food safety audits and inspections.',
      icon: <FactCheckIcon sx={{ fontSize: 40 }} />,
      path: '/admin/audits',
      buttonText: 'Manage Audits',
    },
    {
      title: 'User Management',
      description: 'Add, edit, or remove users from the system.',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/users',
      buttonText: 'Manage Users',
    },
    {
      title: 'Location Management',
      description: 'Manage kitchen locations and their details.',
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      path: '/locations',
      buttonText: 'Manage Locations',
    },
    {
      title: 'Checklist Records',
      description: 'View opening, closing, and weekly checklist records.',
      icon: <ChecklistIcon sx={{ fontSize: 40 }} />,
      path: '/admin/checklists',
      buttonText: 'View Checklists',
    },
    {
      title: 'Food Temperature Records',
      description: 'View all food temperature records.',
      icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
      path: '/records/food-temperature',
      buttonText: 'View Records',
    },
    {
      title: 'Cooling Temperature Records',
      description: 'View all cooling temperature records.',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      path: '/records/cooling-temperature',
      buttonText: 'View Records',
    },
    {
      title: 'Delivery Records',
      description: 'View all delivery records.',
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      path: '/records/delivery',
      buttonText: 'View Records',
    },
    {
      title: 'Equipment Temperature Records',
      description: 'View all equipment temperature records.',
      icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
      path: '/records/equipment-temperature',
      buttonText: 'View Records',
    },
    {
      title: 'Probe Calibration Records',
      description: 'View all probe calibration records.',
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      path: '/records/probe-calibration',
      buttonText: 'View Records',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Logo size="large" />
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Administrator Dashboard
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to the Food Safety Management System. Use the options below to manage your system.
      </Typography>
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: 'primary.main'
                  }}
                >
                  {item.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {item.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(item.path)}
                  size="large"
                >
                  {item.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 