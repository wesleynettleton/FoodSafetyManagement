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
  ArrowBack as ArrowBackIcon,
  ChecklistRtl as ChecklistIcon,
  WbSunny as OpeningIcon,
  Brightness3 as ClosingIcon,
  CalendarMonth as WeeklyIcon
} from '@mui/icons-material';

const AdminChecklistsPage = () => {
  const navigate = useNavigate();

  const checklistTypes = [
    {
      title: 'Opening Checklists',
      description: 'View all opening checklist records across all locations.',
      icon: <OpeningIcon sx={{ fontSize: 40 }} />,
      path: '/admin/checklists/opening',
      buttonText: 'View Opening Records',
      color: 'warning.main'
    },
    {
      title: 'Closing Checklists',
      description: 'View all closing checklist records across all locations.',
      icon: <ClosingIcon sx={{ fontSize: 40 }} />,
      path: '/admin/checklists/closing',
      buttonText: 'View Closing Records',
      color: 'info.main'
    },
    {
      title: 'Weekly Records',
      description: 'View all weekly safety checklist records across all locations.',
      icon: <WeeklyIcon sx={{ fontSize: 40 }} />,
      path: '/admin/checklists/weekly',
      buttonText: 'View Weekly Records',
      color: 'secondary.main'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <ChecklistIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Checklist Records Management
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage checklist records from all locations. Select a checklist type to view detailed records.
      </Typography>

      <Grid container spacing={3}>
        {checklistTypes.map((item) => (
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
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: item.color
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
                  sx={{ 
                    backgroundColor: item.color,
                    '&:hover': {
                      backgroundColor: item.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
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

export default AdminChecklistsPage; 