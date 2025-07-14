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
  Thermostat as ThermostatIcon,
  Build as BuildIcon,
  LocalShipping as LocalShippingIcon,
  Timer as TimerIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Logo from '../components/Logo';

const AdminRecordsPage = () => {
  const navigate = useNavigate();

  const recordItems = [
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
            Records Management
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Access and manage all types of temperature and delivery records from your locations.
      </Typography>
      <Grid container spacing={3}>
        {recordItems.map((item) => (
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

export default AdminRecordsPage; 