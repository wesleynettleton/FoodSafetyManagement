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
  ListAlt as ListAltIcon,
  Thermostat as ThermostatIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import Logo from '../components/Logo';

const KitchenStaffDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'View My Logged Records',
      description: 'See all the records you have submitted.',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
      path: '/my-records'
    },
    {
      title: 'Log Food Temperature',
      description: 'Add a new food temperature check.',
      icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
      path: '/records/food-temperature/add'
    },
    {
      title: 'Log Cooling Temperature',
      description: 'Record food cooling process temperatures.',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      path: '/records/cooling-temperature/add'
    },
    {
      title: 'Log Delivery Temperature',
      description: 'Record temperatures for incoming deliveries.',
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      path: '/records/delivery/add'
    },
    {
      title: 'Log Equipment Temperature',
      description: 'Record fridge/freezer temperatures.',
      icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
      path: '/records/equipment-temperature/add'
    },
    {
      title: 'Log Probe Calibration',
      description: 'Add a new probe calibration entry.',
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      path: '/records/probe-calibration/add'
    },
    {
      title: 'Manage Equipment',
      description: 'Add and manage fridges and freezers.',
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      path: '/equipment'
    },
    {
      title: 'Information',
      description: 'View important food safety guidelines.',
      icon: <InfoIcon sx={{ fontSize: 40 }} />,
      path: '/info'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Logo size="large" />
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Kitchen Staff Dashboard
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome, {user?.name || 'Staff Member'}! Access your tools and log records below.
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
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
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
                  {item.title === 'Manage Equipment' 
                    ? 'Add/Remove Equipment'
                    : item.title === 'Information' || item.title.startsWith('View')
                      ? 'View' 
                      : 'Log Record'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default KitchenStaffDashboard; 