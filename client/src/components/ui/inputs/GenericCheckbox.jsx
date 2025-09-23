"use client";

import React from "react";
import { FormControl, FormControlLabel, Checkbox, FormHelperText } from "@mui/material";

const GenericCheckbox = ({
  name,
  label,
  checked,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  styles,
}) => (
  <FormControl error={error} required={required} disabled={disabled}>
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          className={styles.checkbox}
        />
      }
      label={label}
      classes={{ label: styles?.checkboxLabel }}
    />
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

export default GenericCheckbox;
