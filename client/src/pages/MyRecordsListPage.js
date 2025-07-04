import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Thermostat as ThermostatIcon,
  Build as BuildIcon,
  LocalShipping as LocalShippingIcon,
  Description as DescriptionIcon,
  Apps as AllIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Restaurant as RestaurantIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { recordsAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { locationsAPI } from '../services/api';

const recordTypeFilters = [
  { value: 'all', label: 'All Records', icon: <AllIcon />, color: 'default' },
  { value: 'food_temperature', label: 'Food Temp', icon: <RestaurantIcon />, color: 'error' },
  { value: 'cooling_temperature', label: 'Cooling', icon: <TimerIcon />, color: 'warning' },
  { value: 'probe_calibration', label: 'Probe Cal.', icon: <BuildIcon />, color: 'warning' },
  { value: 'delivery', label: 'Delivery', icon: <LocalShippingIcon />, color: 'info' },
  { value: 'equipment_temperature', label: 'Equip. Temp', icon: <ThermostatIcon />, color: 'success' }
];

const TEMPERATURE_STANDARDS = {
  fridge: {
    min: 1,
    max: 4,
    warningMin: 5,
    warningMax: 8,
    label: '1-4°C',
    guidance: 'Fridges must be kept between 1°C and 4°C to prevent bacterial growth. Above 5°C, bacteria can multiply rapidly.',
    warningGuidance: 'Temperature is in the warning zone (5-8°C). While not immediately dangerous, this temperature should be investigated and corrected soon.'
  },
  freezer: {
    max: -18,
    label: '≤ -18°C',
    guidance: 'Freezers must be kept at -18°C or below to maintain food safety. Higher temperatures can allow bacteria to survive and food to deteriorate.'
  },
  food: {
    hot: {
      min: 63,
      label: '≥ 63°C',
      guidance: 'Hot food must be kept at 63°C or above to prevent bacterial growth. Below this temperature, bacteria can multiply rapidly.'
    },
    cold: {
      max: 8,
      label: '≤ 8°C',
      guidance: 'Cold food must be kept at 8°C or below to prevent bacterial growth. The danger zone is between 8°C and 63°C.'
    }
  },
  delivery: {
    max: 10,
    warningMax: 15,
    label: '≤ 10°C',
    guidance: 'Delivery temperatures must be kept at or below 10°C to prevent bacterial growth. Higher temperatures can allow bacteria to survive and food to deteriorate.'
  }
};

const isTemperatureSafe = (record) => {
  if (!record.temperature) return true; // Don't highlight if no temperature

  if (record.type === 'fridge_temperature') {
    const temp = record.temperature;
    return temp >= TEMPERATURE_STANDARDS.fridge.min && temp <= TEMPERATURE_STANDARDS.fridge.max;
  }
  
  if (record.type === 'freezer_temperature') {
    return record.temperature <= TEMPERATURE_STANDARDS.freezer.max;
  }

  // For food temperatures, we'll use different standards
  if (record.type === 'food_temperature') {
    // Hot food should be above 63°C, cold food below 8°C
    // This is a simplified version - you might want to add more specific rules
    return record.temperature >= 63 || record.temperature <= 8;
  }

  return true; // Don't highlight other types
};

const getTemperatureColor = (record) => {
  if (!record.temperature) return 'text.secondary';
  return isTemperatureSafe(record) ? 'success.main' : 'error.main';
};

const getTemperatureLabel = (record) => {
  if (record.temperature === null || record.temperature === undefined || record.temperature === '') return '-';
  
  let standard = '';
  if (record.type === 'fridge_temperature') {
    standard = ` (Standard: ${TEMPERATURE_STANDARDS.fridge.label})`;
  } else if (record.type === 'freezer_temperature') {
    standard = ` (Standard: ${TEMPERATURE_STANDARDS.freezer.label})`;
  }
  
  return `${record.temperature}°C${standard}`;
};

const getRecordTypeDetails = (record) => {
  if (record.type === 'food_temperature') return { 
    typeDisplay: 'Food Temperature', 
    icon: <RestaurantIcon />,
    color: 'error'
  };
  if (record.type === 'cooling_temperature') return { 
    typeDisplay: 'Cooling Temperature', 
    icon: <TimerIcon />,
    color: 'warning'
  };
  if (record.type === 'probe_calibration') return { 
    typeDisplay: 'Probe Calibration', 
    icon: <BuildIcon />,
    color: 'warning'
  };
  if (record.type === 'delivery') return { 
    typeDisplay: 'Delivery', 
    icon: <LocalShippingIcon />,
    color: 'info'
  };
  if (record.type === 'fridge_temperature' || record.type === 'freezer_temperature') return { 
    typeDisplay: 'Equipment Temperature', 
    icon: <ThermostatIcon />,
    color: 'success'
  };
  return { 
    typeDisplay: 'Record', 
    icon: <DescriptionIcon />,
    color: 'default'
  };
};

const getTemperatureStatus = (record) => {
  if (record.temperature === null || record.temperature === undefined || record.temperature === '') return { status: 'unknown', color: 'text.secondary' };

  if (record.type === 'fridge_temperature') {
    const temp = record.temperature;
    if (temp >= TEMPERATURE_STANDARDS.fridge.min && temp <= TEMPERATURE_STANDARDS.fridge.max) {
      return { status: 'safe', color: 'success.main' };
    }
    if (temp >= TEMPERATURE_STANDARDS.fridge.warningMin && temp <= TEMPERATURE_STANDARDS.fridge.warningMax) {
      return { status: 'warning', color: 'warning.main' };
    }
    return { status: 'danger', color: 'error.main' };
  }
  
  if (record.type === 'freezer_temperature') {
    return record.temperature <= TEMPERATURE_STANDARDS.freezer.max
      ? { status: 'safe', color: 'success.main' }
      : { status: 'danger', color: 'error.main' };
  }

  if (record.type === 'food_temperature') {
    return record.temperature >= 63 || record.temperature <= 8
      ? { status: 'safe', color: 'success.main' }
      : { status: 'danger', color: 'error.main' };
  }

  if (record.type === 'delivery') {
    const temp = record.temperature;
    if (temp < TEMPERATURE_STANDARDS.delivery.max) {
      return { status: 'safe', color: 'success.main' };
    }
    if (temp >= TEMPERATURE_STANDARDS.delivery.max && temp <= TEMPERATURE_STANDARDS.delivery.warningMax) {
      return { status: 'warning', color: 'warning.main' };
    }
    return { status: 'danger', color: 'error.main' };
  }

  return { status: 'unknown', color: 'text.secondary' };
};

const getTemperatureTooltip = (record) => {
  if (record.temperature === null || record.temperature === undefined || record.temperature === '') return 'No temperature recorded';

  if (record.type === 'fridge_temperature') {
    const temp = record.temperature;
    const status = getTemperatureStatus(record);
    let icon = '❓';
    let guidance = '';

    switch (status.status) {
      case 'safe':
        icon = '✅';
        guidance = TEMPERATURE_STANDARDS.fridge.guidance;
        break;
      case 'warning':
        icon = '⚠️';
        guidance = TEMPERATURE_STANDARDS.fridge.warningGuidance;
        break;
      case 'danger':
        icon = '❌';
        guidance = TEMPERATURE_STANDARDS.fridge.guidance;
        break;
    }

    return `${icon} ${guidance}\n\nCurrent: ${temp}°C\nSafe Range: ${TEMPERATURE_STANDARDS.fridge.label}\nWarning Zone: 5-8°C`;
  }
  
  if (record.type === 'freezer_temperature') {
    const isSafe = record.temperature <= TEMPERATURE_STANDARDS.freezer.max;
    return `${isSafe ? '✅' : '⚠️'} ${TEMPERATURE_STANDARDS.freezer.guidance}\n\nCurrent: ${record.temperature}°C\nSafe Range: ${TEMPERATURE_STANDARDS.freezer.label}`;
  }

  if (record.type === 'food_temperature') {
    const temp = record.temperature;
    const isHot = temp >= TEMPERATURE_STANDARDS.food.hot.min;
    const isCold = temp <= TEMPERATURE_STANDARDS.food.cold.max;
    const isSafe = isHot || isCold;
    
    let guidance = isSafe ? '✅ ' : '⚠️ ';
    if (isHot) {
      guidance += TEMPERATURE_STANDARDS.food.hot.guidance;
    } else if (isCold) {
      guidance += TEMPERATURE_STANDARDS.food.cold.guidance;
    } else {
      guidance += 'Food is in the danger zone (8°C - 63°C). Bacteria can multiply rapidly at these temperatures.';
    }
    
    return `${guidance}\n\nCurrent: ${temp}°C\nSafe Ranges:\nHot Food: ${TEMPERATURE_STANDARDS.food.hot.label}\nCold Food: ${TEMPERATURE_STANDARDS.food.cold.label}`;
  }

  return 'Temperature recorded';
};

const MyRecordsListPage = () => {
  const navigate = useNavigate();
  const [allRecords, setAllRecords] = useState([]);
  const [displayedRecords, setDisplayedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useSelector(state => state.auth);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedRecord, setEditedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchRecords = useCallback(async () => {
      setLoading(true);
    setError('');

    if (!user || !user._id) {
      console.warn('MyRecordsListPage: User data (_id) not available, cannot fetch records.');
        setAllRecords([]);
      setError('User data not available to fetch records.');
        setLoading(false);
        return;
      }

      try {
        const response = await recordsAPI.getAll();
        setAllRecords(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch records. Please try again.');
        console.error(err);
        setAllRecords([]);
      } finally {
        setLoading(false);
      }
  }, [user]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Add effect to filter records
  useEffect(() => {
    let filteredRecords;
    if (activeFilter === 'all') {
      filteredRecords = [...allRecords];
    } else if (activeFilter === 'equipment_temperature') {
      // Filter for both fridge and freezer temperature records
      filteredRecords = allRecords.filter(record => 
        record.type === 'fridge_temperature' || record.type === 'freezer_temperature'
      );
    } else {
      filteredRecords = allRecords.filter(record => record.type === activeFilter);
    }
    // Sort by date (newest first)
    filteredRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setDisplayedRecords(filteredRecords);
  }, [allRecords, activeFilter]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setActiveFilter(newFilter);
    }
  };

  const handleDeleteClick = (record) => {
    if (isDeleting) return; // Prevent multiple clicks
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      await recordsAPI.delete(recordToDelete.type, recordToDelete._id);
      // Remove the deleted record from both allRecords and displayedRecords
      setAllRecords(prev => prev.filter(r => r._id !== recordToDelete._id));
      setDisplayedRecords(prev => prev.filter(r => r._id !== recordToDelete._id));
      setDeleteError('');
    } catch (err) {
      setDeleteError(err.response?.data?.msg || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
    setDeleteError('');
  };

  const handleEditClick = (record) => {
    if (isEditing) return; // Prevent multiple clicks
    setEditedRecord(record);
    
    // Initialize form data based on record type
    let initialFormData = {};
    switch (record.type) {
      case 'food_temperature':
        initialFormData = {
          foodName: record.foodName || '',
          temperature: record.temperature || ''
        };
        break;
      case 'probe_calibration':
        initialFormData = {
          probeId: record.probeId || '',
          temperature: record.temperature || '',
          isCalibrated: record.isCalibrated || false
        };
        break;
      case 'delivery':
        initialFormData = {
          supplier: record.supplier || '',
          temperature: record.temperature || '',
          notes: record.notes || ''
        };
        break;
      case 'fridge_temperature':
      case 'freezer_temperature':
        initialFormData = {
          temperature: record.temperature || '',
          note: record.note || ''
        };
        break;
      case 'cooling_temperature':
        initialFormData = {
          foodName: record.foodName || '',
          coolingStartTime: record.coolingStartTime ? new Date(record.coolingStartTime).toISOString().slice(0, 16) : '',
          movedToStorageTime: record.movedToStorageTime ? new Date(record.movedToStorageTime).toISOString().slice(0, 16) : '',
          temperatureAfter90Min: record.temperatureAfter90Min || '',
          temperatureAfter2Hours: record.temperatureAfter2Hours || '',
          correctiveActions: record.correctiveActions || ''
        };
        break;
      default:
        initialFormData = {};
    }
    
    setEditFormData(initialFormData);
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditConfirm = async () => {
    if (!editedRecord || isEditing) return;

    try {
      setIsEditing(true);
      let updatedRecord;
      
      switch (editedRecord.type) {
        case 'food_temperature':
          updatedRecord = await recordsAPI.updateFoodTemperature(editedRecord._id, editFormData);
          break;
        case 'probe_calibration':
          updatedRecord = await recordsAPI.updateProbeCalibration(editedRecord._id, editFormData);
          break;
        case 'delivery':
          updatedRecord = await recordsAPI.updateDelivery(editedRecord._id, editFormData);
          break;
        case 'fridge_temperature':
        case 'freezer_temperature':
          updatedRecord = await recordsAPI.updateTemperature(editedRecord._id, editFormData);
          break;
        case 'cooling_temperature':
          updatedRecord = await recordsAPI.updateCoolingTemperature(editedRecord._id, editFormData);
          break;
        default:
          throw new Error('Unsupported record type');
      }
      
      // Update the edited record in both allRecords and displayedRecords
      const updatedRecordData = updatedRecord.data || updatedRecord;
      setAllRecords(prev => prev.map(r => r._id === editedRecord._id ? updatedRecordData : r));
      setDisplayedRecords(prev => prev.map(r => r._id === editedRecord._id ? updatedRecordData : r));
      setEditError('');
    } catch (err) {
      setEditError(err.response?.data?.msg || err.response?.data?.errors?.map(er => er.msg).join(', ') || 'Failed to update record');
    } finally {
      setIsEditing(false);
      setEditDialogOpen(false);
      setEditedRecord(null);
      setEditFormData({});
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditedRecord(null);
    setEditFormData({});
    setEditError('');
  };

  const getTableHeaders = (activeFilter) => {
    const baseHeaders = ['Type', 'Date'];
    const headers = [...baseHeaders];
    
    switch (activeFilter) {
      case 'food_temperature':
        headers.push('Food Name', 'Temperature', 'Note');
        break;
      case 'cooling_temperature':
        headers.push('Food Name', 'Cooling Start', 'Moved to Storage', '90 Min Temp', '2 Hour Temp', 'Status', 'Corrective Actions');
        break;
      case 'probe_calibration':
        headers.push('Probe ID', 'Temperature', 'Status', 'Note');
        break;
      case 'delivery':
        headers.push('Supplier', 'Temperature', 'Note');
        break;
      case 'equipment_temperature':
        headers.push('Equipment', 'Temperature', 'Note');
        break;
      default:
        headers.push('Details', 'Temperature', 'Note');
    }
    headers.push('Actions');
    return headers;
  };

  const renderTableCell = (record, header) => {
    if (header === 'Actions') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Delete Record">
            <span> {/* Wrap in span to maintain tooltip when button is disabled */}
              <IconButton
                onClick={() => handleDeleteClick(record)}
                size="small"
                color="error"
                disabled={isDeleting}
                sx={{ 
                  '&:hover': { backgroundColor: 'error.lighter' },
                  '&.Mui-disabled': { opacity: 0.5 }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit Record">
            <span> {/* Wrap in span to maintain tooltip when button is disabled */}
              <IconButton
                onClick={() => handleEditClick(record)}
                size="small"
                color="primary"
                disabled={isEditing}
                sx={{ 
                  '&:hover': { backgroundColor: 'primary.lighter' },
                  '&.Mui-disabled': { opacity: 0.5 }
                }}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      );
    }

    const { typeDisplay, icon, color } = getRecordTypeDetails(record);

    switch (header) {
      case 'Type':
        return (
          <Tooltip 
            title={typeDisplay}
            arrow
            placement="top"
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: color === 'default' ? 'text.secondary' : `${color}.main`
            }}>
              {icon}
            </Box>
          </Tooltip>
        );
      case 'Date':
        return (
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {new Date(record.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </Typography>
        );
      case 'Food Name':
        return record.foodName || '-';
      case 'Cooling Start':
        if (record.type === 'cooling_temperature' && record.coolingStartTime) {
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {new Date(record.coolingStartTime).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(record.coolingStartTime).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          );
        }
        return '-';
      case 'Moved to Storage':
        if (record.type === 'cooling_temperature' && record.movedToStorageTime) {
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {new Date(record.movedToStorageTime).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(record.movedToStorageTime).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          );
        }
        return '-';
      case '90 Min Temp':
        return record.type === 'cooling_temperature' ? `${record.temperatureAfter90Min}°C` : '-';
      case '2 Hour Temp':
        if (record.type === 'cooling_temperature') {
          const temp = record.temperatureAfter2Hours;
          const isSafe = temp <= 8;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {temp}°C
              {!isSafe && (
                <Tooltip title="Temperature above 8°C after 2 hours - Requires corrective action">
                  <WarningIcon color="error" sx={{ fontSize: 16 }} />
                </Tooltip>
              )}
            </Box>
          );
        }
        return '-';
      case 'Status':
        if (record.type === 'cooling_temperature') {
          const temp = record.temperatureAfter2Hours;
          return temp <= 8 ? 'Safe' : 'Requires Action';
        }
        return record.isCalibrated ? 'Calibrated' : 'Not Calibrated';
      case 'Corrective Actions':
        return record.type === 'cooling_temperature' ? (record.correctiveActions || '-') : '-';
      case 'Probe ID':
        return record.probeId || '-';
      case 'Supplier':
        return record.supplier || '-';
      case 'Equipment':
        return (
          <Box>
            {record.equipment?.name || record.equipmentName || 'Unknown Equipment'}
            {record.equipmentName && !record.equipment && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                (Equipment deleted)
              </Typography>
            )}
          </Box>
        );
      case 'Temperature':
        if (record.type === 'cooling_temperature') {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">
                90min: {record.temperatureAfter90Min}°C, 2hr: {record.temperatureAfter2Hours}°C
              </Typography>
              {record.temperatureAfter2Hours > 8 && (
                <Tooltip title="Temperature above 8°C after 2 hours - Requires corrective action">
                  <WarningIcon color="error" sx={{ fontSize: 16 }} />
                </Tooltip>
              )}
            </Box>
          );
        }
        const { status, color: tempColor } = getTemperatureStatus(record);
        return (
          <Tooltip 
            title={getTemperatureTooltip(record)}
            arrow
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 1,
                  p: 1.5,
                  whiteSpace: 'pre-line',
                  maxWidth: 300
                }
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: tempColor
            }}>
              <ThermostatIcon sx={{ fontSize: 16 }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {getTemperatureLabel(record)}
                {status !== 'safe' && record.type !== 'probe_calibration' && (
                  <WarningIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: status === 'warning' ? 'warning.main' : 'error.main',
                      ml: 0.5
                    }} 
                  />
                )}
              </Typography>
            </Box>
          </Tooltip>
        );
      case 'Note':
        return record.note || '-';
      case 'Details':
        if (record.type === 'food_temperature') return record.foodName;
        if (record.type === 'probe_calibration') return `Probe: ${record.probeId}`;
        if (record.type === 'delivery') return record.supplier;
        if (record.type === 'cooling_temperature') return record.foodName;
        if (record.type === 'fridge_temperature' || record.type === 'freezer_temperature') {
          const equipmentName = record.equipment?.name || record.equipmentName || 'Unknown';
          const equipmentType = record.equipmentType;
          return `${equipmentName} (${equipmentType})`;
        }
        return '-';
      default:
        return '-';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          My Logged Records
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 1, sm: 2 }, 
          mb: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ToggleButtonGroup
          value={activeFilter}
          exclusive
          onChange={handleFilterChange}
          aria-label="record type filter"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButton-root': {
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              borderRadius: '8px !important',
              border: '1px solid',
              borderColor: 'divider',
              minWidth: { xs: 'auto', sm: '100px' },
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }
            }
          }}
        >
          {recordTypeFilters.map((filter) => (
            <ToggleButton 
              key={filter.value} 
              value={filter.value} 
              aria-label={filter.label}
              sx={{
                '& .MuiSvgIcon-root': {
                  color: filter.color === 'default' ? 'inherit' : `${filter.color}.main`
                }
              }}
            >
              {filter.icon}
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 0.5,
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {filter.label}
              </Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : displayedRecords.length === 0 && !error ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            textAlign: 'center', 
            bgcolor: 'grey.50', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            {activeFilter === 'all' 
              ? 'You have not logged any records yet.' 
              : `No ${recordTypeFilters.find(f => f.value === activeFilter)?.label.toLowerCase()} found.`}
          </Typography>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'auto',
            maxWidth: '100%'
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                {getTableHeaders(activeFilter).map((header) => (
                  <TableCell 
                    key={header}
                    sx={{ 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRecords.map((record) => (
                <TableRow 
                  key={record._id}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  {getTableHeaders(activeFilter).map((header) => (
                    <TableCell 
                      key={`${record._id}-${header}`}
                      sx={{ 
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {renderTableCell(record, header)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Record
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            color="primary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">
          Edit {editedRecord?.type ? getRecordTypeDetails(editedRecord).typeDisplay : 'Record'}
        </DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          
          {editedRecord && (
            <Box sx={{ mt: 1 }}>
              {editedRecord.type === 'food_temperature' && (
                <Box>
                  <TextField
                    autoFocus
                    required
                    fullWidth
                    label="Food Name"
                    value={editFormData.foodName || ''}
                    onChange={(e) => handleEditFormChange('foodName', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Temperature (°C)"
                    type="number"
                    value={editFormData.temperature || ''}
                    onChange={(e) => handleEditFormChange('temperature', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                </Box>
              )}

              {editedRecord.type === 'probe_calibration' && (
                <Box>
                  <TextField
                    autoFocus
                    required
                    fullWidth
                    label="Probe ID"
                    value={editFormData.probeId || ''}
                    onChange={(e) => handleEditFormChange('probeId', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Temperature (°C)"
                    type="number"
                    value={editFormData.temperature || ''}
                    onChange={(e) => handleEditFormChange('temperature', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Calibration Status</InputLabel>
                    <Select
                      value={editFormData.isCalibrated || false}
                      onChange={(e) => handleEditFormChange('isCalibrated', e.target.value)}
                      label="Calibration Status"
                      disabled={isEditing}
                    >
                      <MenuItem value={true}>Calibrated</MenuItem>
                      <MenuItem value={false}>Not Calibrated</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {editedRecord.type === 'delivery' && (
                <Box>
                  <TextField
                    autoFocus
                    required
                    fullWidth
                    label="Supplier"
                    value={editFormData.supplier || ''}
                    onChange={(e) => handleEditFormChange('supplier', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Temperature (°C)"
                    type="number"
                    value={editFormData.temperature || ''}
                    onChange={(e) => handleEditFormChange('temperature', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={editFormData.notes || ''}
                    onChange={(e) => handleEditFormChange('notes', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                </Box>
              )}

              {(editedRecord.type === 'fridge_temperature' || editedRecord.type === 'freezer_temperature') && (
                <Box>
                  <TextField
                    autoFocus
                    required
                    fullWidth
                    label="Temperature (°C)"
                    type="number"
                    value={editFormData.temperature || ''}
                    onChange={(e) => handleEditFormChange('temperature', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    fullWidth
                    label="Note"
                    multiline
                    rows={3}
                    value={editFormData.note || ''}
                    onChange={(e) => handleEditFormChange('note', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                </Box>
              )}

              {editedRecord.type === 'cooling_temperature' && (
                <Box>
                  <TextField
                    autoFocus
                    required
                    fullWidth
                    label="Food Name"
                    value={editFormData.foodName || ''}
                    onChange={(e) => handleEditFormChange('foodName', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Cooling Start Time"
                    type="datetime-local"
                    value={editFormData.coolingStartTime || ''}
                    onChange={(e) => handleEditFormChange('coolingStartTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Moved to Storage Time"
                    type="datetime-local"
                    value={editFormData.movedToStorageTime || ''}
                    onChange={(e) => handleEditFormChange('movedToStorageTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Temperature After 90 Min (°C)"
                    type="number"
                    value={editFormData.temperatureAfter90Min || ''}
                    onChange={(e) => handleEditFormChange('temperatureAfter90Min', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Temperature After 2 Hours (°C)"
                    type="number"
                    value={editFormData.temperatureAfter2Hours || ''}
                    onChange={(e) => handleEditFormChange('temperatureAfter2Hours', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                  <TextField
                    fullWidth
                    label="Corrective Actions"
                    multiline
                    rows={3}
                    value={editFormData.correctiveActions || ''}
                    onChange={(e) => handleEditFormChange('correctiveActions', e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isEditing}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleEditCancel} 
            color="primary"
            disabled={isEditing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditConfirm} 
            color="primary" 
            disabled={isEditing}
            autoFocus
          >
            {isEditing ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyRecordsListPage; 