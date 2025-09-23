import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

export default function Spinner({ size, color, sx = {} }) {
  return (
    <CircularProgress
      size={size}
      color={color}
      sx={{
        ...sx, 
      }}
    />
  );
}
