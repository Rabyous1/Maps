'use client';
import React, { useState, useRef } from "react";
import { addDays } from "date-fns";
import { DateRangePicker } from "react-date-range";
import { Box, Popper, Paper, TextField } from "@mui/material";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DateRange({
  value,
  onChange,
  placeholder = 'Select range',
  className = '',
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

const [state, setState] = useState([
  {
    startDate: value?.startDate || null,
    endDate: value?.endDate || null,
    key: "selection",
  },
]);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

const handleRangeChange = (item) => {
  const { startDate, endDate } = item.selection;

  const formattedRange = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };

  setState([item.selection]);
  onChange?.(formattedRange); 
  setOpen(false);
};


  const formatRange = () => {
    const { startDate, endDate } = state[0];
    return `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;
  };

  return (
    <Box className={className}>
    <TextField
      inputRef={inputRef}
      onClick={handleClick}
      value={
        value?.startDate && value?.endDate
          ? formatRange()
          : ''
      }
      inputProps={{ readOnly: true }}
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      sx={{
        cursor: 'pointer', 
        '& input': {
          cursor: 'pointer',
        },
        '& legend': { display: 'none' },
        '& fieldset': { top: 0 },
      }}
    />




      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300 }}>
        <Paper sx={{ mt: 1 }}>
          <DateRangePicker
            onChange={handleRangeChange}
            showSelectionPreview
            moveRangeOnFirstSelection={false}
            months={1}
            ranges={state}
            direction="horizontal"
          />
        </Paper>
      </Popper>
    </Box>
  );
}
