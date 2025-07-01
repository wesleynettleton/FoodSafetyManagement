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
  WbSunny as OpeningIcon,
  NightsStay as ClosingIcon,
  CalendarMonth as WeeklyIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const ChecklistsPage = () => {
  const navigate = useNavigate();

  const checklistTypes = [
    {
      title: 'Opening Checklist',
      description: 'Complete daily opening safety checks and procedures.',
      icon: <OpeningIcon sx={{ fontSize: 40 }} />,
      path: '/checklists/opening',
      color: 'success',
      buttonText: 'Start Opening Checklist'
    },
    {
      title: 'Closing Checklist',
      description: 'Complete daily closing safety checks and procedures.',
      icon: <ClosingIcon sx={{ fontSize: 40 }} />,
      path: '/checklists/closing',
      color: 'primary',
      buttonText: 'Start Closing Checklist'
    },
    {
      title: 'Weekly Record',
      description: 'Complete weekly safety record and maintenance checks.',
      icon: <WeeklyIcon sx={{ fontSize: 40 }} />,
      path: '/checklists/weekly',
      color: 'secondary',
      buttonText: 'Start Weekly Record'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Safety Checklists
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete your daily and weekly safety checklists to ensure food safety compliance and maintain high standards.
      </Typography>

      <Grid container spacing={3}>
        {checklistTypes.map((checklist) => (
          <Grid item xs={12} sm={6} md={4} key={checklist.title}>
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
                    color: `${checklist.color}.main`
                  }}
                >
                  {checklist.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {checklist.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {checklist.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  color={checklist.color}
                  onClick={() => navigate(checklist.path)}
                  size="large"
                >
                  {checklist.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ChecklistsPage; 