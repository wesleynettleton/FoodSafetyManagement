import React from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box
} from '@mui/material';
import {
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Assignment as RecordsIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    {
      title: 'Users',
      value: 'Manage Users',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/users',
      adminOnly: true
    },
    {
      title: 'Locations',
      value: 'Manage Locations',
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      path: '/locations',
      adminOnly: true
    },
    {
      title: 'Records',
      value: 'View Records',
      icon: <RecordsIcon sx={{ fontSize: 40 }} />,
      path: '/records',
      adminOnly: false
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {user?.role === 'admin' ? 'Administrator Dashboard' : 'Kitchen Staff Dashboard'}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat) => (
          (!stat.adminOnly || user?.role === 'admin') && (
            <Grid item xs={12} sm={6} md={4} key={stat.title}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => window.location.href = stat.path}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          )
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 