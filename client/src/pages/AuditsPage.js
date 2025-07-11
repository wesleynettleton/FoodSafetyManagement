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
  Visibility as VisibilityIcon,
  FactCheck as FactCheckIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';

const AuditsPage = () => {
  const navigate = useNavigate();

  const auditCards = [
    {
      title: 'Take Audit',
      description: 'Conduct a new food safety audit or inspection at a location.',
      icon: <FactCheckIcon sx={{ fontSize: 40 }} />,
      path: '/admin/audits/take',
      buttonText: 'Start Audit',
      color: 'primary'
    },
    {
      title: 'Audit Records',
      description: 'View all completed and scheduled food safety audits and their results.',
      icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
      path: '/admin/audits/view',
      buttonText: 'View Records',
      color: 'secondary'
    }
  ];

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Food Safety Audits
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage food safety audits and inspections to ensure compliance and maintain high standards.
        </Typography>

        {/* Audit Action Cards */}
        <Grid container spacing={4} justifyContent="center">
          {auditCards.map((card, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 300,
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-4px)'
                  },
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 3,
                      color: `${card.color}.main`
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography gutterBottom variant="h4" component="h2" sx={{ mb: 2 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    color={card.color}
                    onClick={() => navigate(card.path)}
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {card.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
};

export default AuditsPage; 