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
  Box,
  Paper,
  IconButton
} from '@mui/material';
import {
  Thermostat as ThermostatIcon, // Food Temperature & General Temperature
  Build as BuildIcon, // Probe Calibration
  LocalShipping as LocalShippingIcon, // Delivery
  ListAlt as ListAltIcon, // Generic Records Icon
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const recordTypesConfig = [
  {
    title: 'Food Temperature Records',
    description: 'Log and monitor food temperatures.',
    path: '/records/food-temperature',
    icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
    key: 'food-temperature'
  },
  {
    title: 'Probe Calibration Records',
    description: 'Log probe calibration activities.',
    path: '/records/probe-calibration',
    icon: <BuildIcon sx={{ fontSize: 40 }} />,
    key: 'probe-calibration'
  },
  {
    title: 'Delivery Records',
    description: 'Track incoming deliveries and their temperatures.',
    path: '/records/delivery',
    icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
    key: 'delivery'
  },
  {
    title: 'Equipment Temperature Records',
    description: 'Log fridge, freezer, and other equipment temperatures.',
    path: '/records/equipment-temperature',
    icon: <ThermostatIcon sx={{ fontSize: 40 }} />, // Can reuse or find a more specific one
    key: 'equipment-temperature'
  }
];

const Records = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Records Management
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select a record type below to view, add, or manage entries.
      </Typography>
      <Grid container spacing={3}>
        {recordTypesConfig.map((recordType) => (
          <Grid item xs={12} sm={6} md={4} key={recordType.key}>
            <Card 
              component={Paper} 
              elevation={3}
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
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'primary.main' }}>
                  {recordType.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {recordType.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {recordType.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate(recordType.path)} 
                  size="large"
                >
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Records; 