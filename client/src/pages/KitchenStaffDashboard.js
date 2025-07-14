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
  Build as BuildIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  ChecklistRtl as ChecklistIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  FactCheck as FactCheckIcon
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
      title: 'Take Records',
      description: 'Log temperatures and safety checks.',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      path: '/take-records'
    },
    {
      title: 'View Audits',
      description: 'View audit results and reports for your location.',
      icon: <FactCheckIcon sx={{ fontSize: 40 }} />,
      path: '/admin/audits/view'
    },
    {
      title: 'Checklists',
      description: 'Complete daily and weekly safety checklists.',
      icon: <ChecklistIcon sx={{ fontSize: 40 }} />,
      path: '/checklists'
    },
    {
      title: 'Manage Equipment',
      description: 'Add and manage fridges and freezers.',
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      path: '/equipment'
    },
    {
      title: 'View Analytics',
      description: 'See your location\'s compliance rates and trends.',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      path: '/admin/analytics'
    },
    {
      title: 'Compliance Reports',
      description: 'Generate compliance reports for your location.',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/compliance-reports'
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
                      : item.title === 'Take Records'
                        ? 'Start Recording'
                        : item.title === 'Checklists'
                          ? 'View Checklists'
                          : item.title === 'Compliance Reports'
                            ? 'Generate Reports'
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