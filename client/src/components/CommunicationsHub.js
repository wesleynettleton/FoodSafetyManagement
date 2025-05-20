import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

const CommunicationsHub = () => {
  const [communications, setCommunications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedComm, setSelectedComm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
  });
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      const response = await axios.get('/api/communications/my-communications');
      setCommunications(response.data);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const handleOpenDialog = (comm = null) => {
    if (comm) {
      setSelectedComm(comm);
      setFormData({
        title: comm.title,
        content: comm.content,
        priority: comm.priority,
      });
    } else {
      setSelectedComm(null);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedComm(null);
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedComm) {
        await axios.patch(`/api/communications/${selectedComm._id}`, formData);
      } else {
        await axios.post('/api/communications', formData);
      }
      handleCloseDialog();
      fetchCommunications();
    } catch (error) {
      console.error('Error saving communication:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`/api/communications/${id}`);
        fetchCommunications();
      } catch (error) {
        console.error('Error deleting communication:', error);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(`/api/communications/${id}/read`);
      fetchCommunications();
    } catch (error) {
      console.error('Error marking communication as read:', error);
    }
  };

  const handleAddSamples = async () => {
    if (window.confirm('Add sample communications? This will add 5 sample messages to the communications hub.')) {
      try {
        await axios.post('/api/communications/add-samples');
        fetchCommunications();
      } catch (error) {
        console.error('Error adding sample communications:', error);
      }
    }
  };

  const unreadCount = communications.filter(comm => !comm.isRead).length;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }}>
            <NotificationsIcon />
          </Badge>
          Communications Hub
        </Typography>
        <Box>
          {process.env.NODE_ENV === 'development' && isAdmin && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleAddSamples}
              sx={{ mr: 2 }}
            >
              Add Samples
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog()}
            >
              New Message
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {communications.map((comm) => (
          <Grid item xs={12} key={comm._id}>
            <Card
              sx={{
                opacity: comm.isRead ? 0.8 : 1,
                borderLeft: 6,
                borderColor: `${priorityColors[comm.priority]}.main`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {comm.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Posted by {comm.author.name} on{' '}
                      {format(new Date(comm.createdAt), 'MMM d, yyyy h:mm a')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {comm.content}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={comm.priority}
                      color={priorityColors[comm.priority]}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {!comm.isRead && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(comm._id)}
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isAdmin && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(comm)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(comm._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedComm ? 'Edit Message' : 'New Message'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            <TextField
              select
              margin="dense"
              label="Priority"
              fullWidth
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedComm ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CommunicationsHub; 