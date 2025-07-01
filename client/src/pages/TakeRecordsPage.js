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
  IconButton
} from '@mui/material';
import {
  Thermostat as ThermostatIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  Timer as TimerIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const TakeRecordsPage = () => {
  const navigate = useNavigate();

  const recordTypes = [
    {
      title: 'Log Food Temperature',
      description: 'Add a new food temperature check.',
      icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
      path: '/records/food-temperature/add',
      color: 'error'
    },
    {
      title: 'Log Cooling Temperature',
      description: 'Record food cooling process temperatures.',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      path: '/records/cooling-temperature/add',
      color: 'warning'
    },
    {
      title: 'Log Delivery Temperature',
      description: 'Record temperatures for incoming deliveries.',
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      path: '/records/delivery/add',
      color: 'info'
    },
    {
      title: 'Log Equipment Temperature',
      description: 'Record fridge/freezer temperatures.',
      icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
      path: '/records/equipment-temperature/add',
      color: 'success'
    },
    {
      title: 'Log Probe Calibration',
      description: 'Add a new probe calibration entry.',
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      path: '/records/probe-calibration/add',
      color: 'secondary'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Take Records
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select the type of record you want to log. All temperature and safety checks can be logged here.
      </Typography>

      <Grid container spacing={3}>
        {recordTypes.map((record) => (
          <Grid item xs={12} sm={6} md={4} key={record.title}>
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
                    color: `${record.color}.main`
                  }}
                >
                  {record.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {record.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {record.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  color={record.color}
                  onClick={() => navigate(record.path)}
                  size="large"
                >
                  Start Logging
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TakeRecordsPage; 