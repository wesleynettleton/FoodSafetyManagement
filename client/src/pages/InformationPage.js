import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Thermostat as ThermostatIcon,
  Restaurant as RestaurantIcon,
  Build as BuildIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InformationPage = () => {
  const navigate = useNavigate();

  const guidelines = [
    {
      title: 'Food Temperature Safety',
      icon: <RestaurantIcon color="error" />,
      items: [
        'Hot food must be kept at 63°C or above',
        'Cold food must be kept at 8°C or below',
        'Food should not be kept in the danger zone (8°C - 63°C) for more than 2 hours',
        'Always check food temperatures before serving'
      ]
    },
    {
      title: 'Equipment Temperature Standards',
      icon: <ThermostatIcon color="success" />,
      items: [
        'Fridges must be kept between 1°C and 4°C',
        'Freezers must be kept at -18°C or below',
        'Check temperatures at least twice daily',
        'Record all temperature readings immediately'
      ]
    },
    {
      title: 'Probe Calibration',
      icon: <BuildIcon color="warning" />,
      items: [
        'Calibrate probes before each use',
        'Use ice water (0°C) or boiling water (100°C) for calibration',
        'Probes must be within ±1°C of calibration temperature',
        'Record all calibration results'
      ]
    },
    {
      title: 'Delivery Checks',
      icon: <LocalShippingIcon color="info" />,
      items: [
        'Check delivery temperatures immediately upon arrival',
        'Reject deliveries that are not at safe temperatures',
        'Record all delivery temperatures',
        'Store chilled items immediately after checking'
      ]
    },
    {
      title: 'General Food Safety',
      icon: <WarningIcon color="error" />,
      items: [
        'Always wash hands before handling food',
        'Use separate equipment for raw and cooked food',
        'Clean and sanitize all surfaces regularly',
        'Report any food safety concerns immediately'
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Food Safety Guidelines
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Important guidelines and standards for maintaining food safety in your kitchen.
      </Typography>

      {guidelines.map((section, index) => (
        <Paper key={section.title} elevation={2} sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {section.icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {section.title}
            </Typography>
          </Box>
          <List>
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={itemIndex}>
                <ListItem>
                  <ListItemText primary={item} />
                </ListItem>
                {itemIndex < section.items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ))}
    </Container>
  );
};

export default InformationPage; 