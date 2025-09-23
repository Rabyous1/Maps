"use client";
import React from "react";
import {
  TextField,
  FormHelperText,
  FormControl,
  IconButton,
} from "@mui/material";

import InputAdornment from "@mui/material/InputAdornment";
import EyeOn from "@/assets/icons/auth/icon-eyeon.svg";
import EyeOff from "@/assets/icons/auth/icon-eyeoff.svg";


// const GenericTextField = ({
//   name, value, onChange, onBlur,
//   error, helperText, required,
//   placeholder, type, multiline,
//   rows, maxRows, minRows,
//   disabled, variant,
//   label, labelClassName,
//   styles,

// }) => {
//   const id = name;
//   const isPassword = type === "password";
//   const [show, setShow] = React.useState(false);
//   return (
//     <FormControl fullWidth disabled={disabled} error={error} required={required}>
//       {label && <label htmlFor={id} className={labelClassName}>{label}</label>}
//       <TextField
//         id={id}
//         name={name}
//         value={value}
//         onChange={onChange}
//         onBlur={onBlur}
//         placeholder={placeholder}
//         type={isPassword ? (show ? "text" : "password") : type}
//         multiline={multiline}
//         rows={rows}
//         maxRows={maxRows}
//         minRows={minRows}
//         variant={variant}
//         error={error}

//         InputProps={{
//           // disableUnderline: true,
//           endAdornment: isPassword && (
//             <InputAdornment position="end">
//               <IconButton onClick={() => setShow(s => !s)} edge="end" className={styles.visibiltyIcon}>
//                 {show ?  <EyeOff alt="VisibilityOff" className={styles.icon_eye}/> : <EyeOn alt="VisibilityOn" className={styles.icon_eye}/>}
//               </IconButton>
//             </InputAdornment>
//           ),
//         }}
//       />
//       {helperText && (
//         <FormHelperText id={`${id}-helper-text`}>
//           {helperText}
//         </FormHelperText>
//       )}
//     </FormControl>
//   );
// };
const GenericTextField = ({
  name, value, onChange, onBlur,
  error, helperText, required,
  placeholder, type, multiline,
  rows, maxRows, minRows,
  disabled, variant,
  label, labelClassName,
  styles,
}) => {
  const id = name;
  const isPassword = type === "password";
  const [show, setShow] = React.useState(false);
  
  // Calculate textarea rows
  const textareaProps = multiline ? {
    minRows: minRows || 4,
    maxRows: maxRows || 10,
  } : {};

  return (
    <FormControl fullWidth disabled={disabled} error={error} required={required}>
      {label && <label htmlFor={id} className={labelClassName}>{label}</label>}
      <TextField
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        type={isPassword ? (show ? "text" : "password") : type}
        multiline={multiline}
        variant={variant}
        error={error}
        {...textareaProps}  // Apply minRows/maxRows only when multiline
        
        InputProps={{
          endAdornment: isPassword && (
            <InputAdornment position="end">
              <IconButton onClick={() => setShow(s => !s)} edge="end" className={styles.visibiltyIcon}>
                {show ?  <EyeOff alt="VisibilityOff" className={styles.icon_eye}/> : <EyeOn alt="VisibilityOn" className={styles.icon_eye}/>}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {helperText && (
        <FormHelperText id={`${id}-helper-text`}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};


export default GenericTextField;
