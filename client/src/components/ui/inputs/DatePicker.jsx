import React from "react";
import {
  TextField,
  FormHelperText,
  FormControl,
} from "@mui/material";

export default function GenericDateTextField({
  name,
  label,
  labelClassName,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = "date",
  styles = {},
}) {
  const id = name;

  return (
    <FormControl fullWidth disabled={disabled} error={error} required={required}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <TextField
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        error={error}
        sx={{
          "& input[type='date']::-webkit-calendar-picker-indicator": {
            opacity: 1,
            filter:
              "brightness(0) saturate(100%) invert(54%) sepia(71%) saturate(3905%) hue-rotate(210deg) brightness(102%) contrast(101%)",
          }
        }}
      />
      {helperText && (
        <FormHelperText id={`${id}-helper-text`}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
