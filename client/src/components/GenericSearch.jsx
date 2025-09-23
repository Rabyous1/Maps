import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function GenericSearch({
  value,
  onChange,
  options = [],
  placeholder = 'Search...',
  styles = {},
  freeSolo = true,
  icon,  // New optional prop for icon
}) {
  const IconComponent = icon || SearchIcon;

  return (
    <div className={styles.searchWrapper}>
      <Autocomplete
        className={styles.input}
        freeSolo={freeSolo}
        options={options}
        inputValue={value}
        onInputChange={(_, newVal) => onChange(newVal)}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.label
        }
        isOptionEqualToValue={(option, value) =>
          option.id === value.id
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <IconComponent />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </div>
  );
}
