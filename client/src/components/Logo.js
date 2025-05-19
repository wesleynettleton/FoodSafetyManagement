import React from 'react';
import { Box } from '@mui/material';
import logo from '../assets/meals-logo.png';

const Logo = ({ size = 'large' }) => {
  let height;
  if (size === 'xlarge') height = 120;
  else if (size === 'large') height = 60;
  else height = 36;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={logo}
        alt="Meals Logo"
        style={{ height, width: 'auto', display: 'block' }}
      />
    </Box>
  );
};

export default Logo; 