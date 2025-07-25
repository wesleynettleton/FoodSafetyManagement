import { Warning as WarningIcon, Thermostat as ThermostatIcon } from '@mui/icons-material';
import { Tooltip, Box, Typography } from '@mui/material';

export const TEMPERATURE_STANDARDS = {
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
    max: 8,
    warningMax: 10,
    label: '≤ 8°C',
    guidance: 'Deliveries must be kept at 8°C or below to prevent bacterial growth.',
    warningGuidance: 'Temperature is in the warning zone (8-10°C). While not immediately dangerous, this temperature should be investigated and corrected soon.'
  }
};

export const getTemperatureStatus = (record) => {
  if (!record.temperature) return { status: 'unknown', color: 'text.secondary' };

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

  // Updated delivery temperature logic
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

export const getTemperatureTooltip = (record) => {
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

  if (record.type === 'delivery') {
    const temp = record.temperature;
    const status = getTemperatureStatus(record);
    let icon = '❓';
    let guidance = '';

    switch (status.status) {
      case 'safe':
        icon = '✅';
        guidance = TEMPERATURE_STANDARDS.delivery.guidance;
        break;
      case 'warning':
        icon = '⚠️';
        guidance = TEMPERATURE_STANDARDS.delivery.warningGuidance;
        break;
      case 'danger':
        icon = '❌';
        guidance = TEMPERATURE_STANDARDS.delivery.guidance;
        break;
    }

    return `${icon} ${guidance}\n\nCurrent: ${temp}°C\nSafe Range: ${TEMPERATURE_STANDARDS.delivery.label}\nWarning Zone: 8-10°C`;
  }

  return 'Temperature recorded';
};

export const getTemperatureLabel = (record) => {
  if (record.temperature === null || record.temperature === undefined || record.temperature === '') return '-';
  
  let standard = '';
  if (record.type === 'fridge_temperature') {
    standard = ` (Standard: ${TEMPERATURE_STANDARDS.fridge.label})`;
  } else if (record.type === 'freezer_temperature') {
    standard = ` (Standard: ${TEMPERATURE_STANDARDS.freezer.label})`;
  }
  
  return `${record.temperature}°C${standard}`;
};

// Test function for temperature validation
export const testTemperatureValidation = () => {
  const testCases = [
    { type: 'delivery', temperature: 4, expected: 'safe' },
    { type: 'delivery', temperature: 5, expected: 'safe' },
    { type: 'delivery', temperature: 7.9, expected: 'safe' },
    { type: 'delivery', temperature: 8, expected: 'warning' },
    { type: 'delivery', temperature: 9, expected: 'warning' },
    { type: 'delivery', temperature: 10, expected: 'warning' },
    { type: 'delivery', temperature: 10.1, expected: 'danger' },
    { type: 'delivery', temperature: 11, expected: 'danger' }
  ];

  console.group('Temperature Validation Test Results');
  testCases.forEach(test => {
    const result = getTemperatureStatus(test);
    const passed = result.status === test.expected;
    console.log(
      `%c${test.temperature}°C: ${result.status} (${passed ? '✓' : '✗'})`,
      `color: ${passed ? 'green' : 'red'}`
    );
    console.log('Details:', {
      temperature: test.temperature,
      expected: test.expected,
      actual: result.status,
      color: result.color
    });
  });
  console.groupEnd();
};

// Make the test function available globally for console testing
if (typeof window !== 'undefined') {
  window.testTemperatureValidation = testTemperatureValidation;
}

export const TemperatureCell = ({ record }) => {
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
          {(status === 'warning' || status === 'danger') && record.type !== 'probe_calibration' && (
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
}; 