import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { equipmentAPI } from '../services/api';

const EquipmentManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'fridge'
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch equipment. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpen = (equip = null) => {
    if (equip) {
      setFormData({
        name: equip.name,
        type: equip.type
      });
      setEditingEquipment(equip);
    } else {
      setFormData({
        name: '',
        type: 'fridge'
      });
      setEditingEquipment(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingEquipment) {
        await equipmentAPI.update(editingEquipment._id, formData);
      } else {
        await equipmentAPI.create(formData);
      }
      handleClose();
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save equipment');
    }
  };

  const handleDelete = async (id) => {
    const equipmentToDelete = equipment.find(eq => eq._id === id);
    const confirmMessage = `Are you sure you want to delete "${equipmentToDelete?.name}"?\n\n⚠️ Warning: This action cannot be undone. Any existing temperature records for this equipment will be preserved with the equipment name.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await equipmentAPI.delete(id);
        setSuccess(response.data.msg || 'Equipment deleted successfully');
        fetchEquipment();
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } catch (err) {
        const errorMessage = err.response?.data?.msg || 'Failed to delete equipment';
        setError(errorMessage);
        console.error('Equipment deletion error:', err);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading equipment...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Equipment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Equipment
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> When deleting equipment, any existing temperature records will be preserved 
          with the equipment name for historical reference. This ensures no data is lost.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.map((equip) => (
              <TableRow key={equip._id}>
                <TableCell>{equip.name}</TableCell>
                <TableCell>{equip.type}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(equip)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(equip._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Equipment Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Equipment Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Equipment Type"
            >
              <MenuItem value="fridge">Fridge</MenuItem>
              <MenuItem value="freezer">Freezer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEquipment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EquipmentManagementPage; 