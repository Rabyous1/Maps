import React from "react";
import { FormControl, FormHelperText } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";

const PhoneInput = ({
  name,
  label,
  labelClassName,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  fullWidth = true,
  variant = "outlined",
  disabled = false,
  required = false,
  ariaLabel,
  defaultCountry = "FR",
  placeholder = "",
  styles,
}) => {
  const id = name;

  const handlePhoneChange = (value) => {
    onChange({ target: { name, value } });
  };

  return (
    <FormControl fullWidth={fullWidth} variant={variant} disabled={disabled} error={error} required={required}>
      <label htmlFor={name} className={labelClassName}>{label}</label>

      <MuiTelInput
        id={id}
        value={value}
        
        onChange={handlePhoneChange}
        onBlur={onBlur}
        defaultCountry={defaultCountry}
        aria-label={ariaLabel}
        placeholder={placeholder}
        
      />

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default PhoneInput;
