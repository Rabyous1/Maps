// 'use client';
// import React from 'react';
// import {
//   TextField,
//   MenuItem,
//   FormControl,
//   InputAdornment,
//   IconButton,
//   FormHelperText,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';

// export default function Select({
//   name,
//   label,
//   labelClassName,
//   value,
//   options,
//   onChange,
//   onBlur,
//   error,
//   helperText,
//   fullWidth = true,
//   variant = 'outlined',
//   disabled = false,
//   required = false,
//   placeholder,
//   styles,
//   clearable = false,
//   onClear = () => {},
// }) {
//   const id = name;

//   return (
//     <FormControl fullWidth={fullWidth} variant={variant} error={error} required={required}>
//       {label && (
//         <label htmlFor={id} className={labelClassName}>
//           {label}
//         </label>
//       )}
//       <TextField
//         id={id}
//         name={name}
//         select
//         fullWidth
//         variant={variant}
//         value={value || ''}
//         onChange={onChange}
//         onBlur={onBlur}
//         disabled={disabled}
//         required={required}
//         error={error}
//         helperText={helperText}
//         displayEmpty
//         InputProps={{
//           classes: {
//             root: styles.inputRoot,
//             notchedOutline: styles.inputOutline,
//             focused: styles.inputFocused,
//           },
//           startAdornment:
//             clearable && value ? (
//               <InputAdornment position="start">
//                 <IconButton
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onClear();
//                   }}
//                 >
//                   <CloseIcon className={styles.closeItemIcon}/>
//                 </IconButton>
//               </InputAdornment>
//             ) : null,
//         }}
//         SelectProps={{
//           displayEmpty: true,
//           renderValue: (val) => {
//             if (!val) {
//               return (
//                 <span className={styles.placeholderselect}>
//                   {placeholder || `— ${label} —`}
//                 </span>
//               );
//             }
//             const selectedOption = options.find((opt) => opt.value === val);
//             return selectedOption ? selectedOption.label : '';
//           },
//           classes: {
//             icon: styles.inputIcon,
//           },
//           IconComponent: clearable && value ? () => null : undefined,
//         }}
//       >
//         <MenuItem disabled value="">
//           {placeholder || `— ${label} —`}
//         </MenuItem>

//         {options.map((opt) => (
//           <MenuItem key={opt.value} value={opt.value}>
//             {opt.label}
//           </MenuItem>
//         ))}
//       </TextField>
//     </FormControl>
//   );
// }
// 'use client';
// import React, { useState } from 'react';
// import {
//   TextField,
//   MenuItem,
//   FormControl,
//   InputAdornment,
//   IconButton,
//   FormHelperText,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';

// export default function Select({
//   name,
//   label,
//   labelClassName,
//   value,
//   options = [],
//   onChange,
//   onBlur,
//   error,
//   helperText,
//   fullWidth = true,
//   variant = 'outlined',
//   disabled = false,
//   required = false,
//   placeholder,
//   styles,
//   clearable = false,
//   onClear = () => {},
// }) {
//   const id = name;
//   const [open, setOpen] = useState(false);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   return (
//     <FormControl fullWidth={fullWidth} variant={variant} error={error} required={required}>
//       {label && (
//         <label htmlFor={id} className={labelClassName}>
//           {label}
//         </label>
//       )}

//       <TextField
//         id={id}
//         name={name}
//         select
//         fullWidth
//         variant={variant}
//         value={value ?? ''}
//         onChange={onChange}
//         onBlur={onBlur}
//         disabled={disabled}
//         required={required}
//         error={error}
//         helperText={helperText}
//         displayEmpty
//         InputProps={{
//           classes: {
//             root: styles?.inputRoot,
//             notchedOutline: styles?.inputOutline,
//             focused: styles?.inputFocused,
//           },
//           startAdornment:
//             clearable && value ? (
//               <InputAdornment position="start">
//                 <IconButton
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onClear();
//                   }}
//                 >
//                   <CloseIcon className={styles?.closeItemIcon}/>
//                 </IconButton>
//               </InputAdornment>
//             ) : null,
//         }}
//         SelectProps={{
//           displayEmpty: true,
//           renderValue: (val) => {
//             if (!val) {
//               return (
//                 <span className={styles?.placeholderselect}>
//                   {placeholder || `— ${label} —`}
//                 </span>
//               );
//             }
//             const selectedOption = options.find((opt) => String(opt.value) === String(val));
//             return selectedOption ? selectedOption.label : '';
//           },
//           classes: {
//             icon: styles?.inputIcon,
//           },
//           open,
//           onOpen: handleOpen,
//           onClose: handleClose,
//         }}
//       >
//         <MenuItem disabled value="">
//           {placeholder || `— ${label} —`}
//         </MenuItem>

//         {options.map((opt) => {
//           const optValue = String(opt.value);
//           const isLoadMore = optValue === "__load_more__";

//           return (
//             <MenuItem
//               key={optValue}
//               value={optValue}
//               onMouseDown={isLoadMore ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}
//               onClick={(e) => {
//                 if (isLoadMore) {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   onChange && onChange({ target: { value: optValue } });
//                   setTimeout(() => setOpen(true), 0);
//                 } else {
                
//                   setOpen(false);
//                 }
//               }}
//               onKeyDown={(e) => {
//                 if (isLoadMore && (e.key === 'Enter' || e.key === ' ')) {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   onChange && onChange({ target: { value: optValue } });
//                   setTimeout(() => setOpen(true), 0);
//                 }
//               }}
//             >
//               {opt.label}
//             </MenuItem>
//           );
//         })}
//       </TextField>

//       {helperText && <FormHelperText>{helperText}</FormHelperText>}
//     </FormControl>
//   );
// }
// 'use client';
// import React, { useState, useRef } from 'react';
// import {
//   TextField,
//   MenuItem,
//   FormControl,
//   InputAdornment,
//   IconButton,
//   FormHelperText,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';

// export default function Select({
//   name,
//   label,
//   labelClassName,
//   value,
//   options = [],
//   onChange,
//   onBlur,
//   error,
//   helperText,
//   fullWidth = true,
//   variant = 'outlined',
//   disabled = false,
//   required = false,
//   placeholder,
//   styles,
//   clearable = false,
//   onClear = () => {},
// }) {
//   const id = name;
//   const [open, setOpen] = useState(false);

//   // when true, we want to keep the menu open (used for "load more" items)
//   const preventCloseRef = useRef(false);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   // wrapped onClose: if preventCloseRef is set, reopen immediately and reset the flag
//   const handleSelectClose = (event) => {
//     if (preventCloseRef.current) {
//       // reset the flag and reopen (use setTimeout to allow MUI internal close to finish)
//       preventCloseRef.current = false;
//       setTimeout(() => setOpen(true), 0);
//       return;
//     }
//     handleClose();
//   };

//   return (
//     <FormControl fullWidth={fullWidth} variant={variant} error={error} required={required}>
//       {label && (
//         <label htmlFor={id} className={labelClassName}>
//           {label}
//         </label>
//       )}

//       <TextField
//         id={id}
//         name={name}
//         select
//         fullWidth
//         variant={variant}
//         value={value ?? ''}
//         onChange={onChange}
//         onBlur={onBlur}
//         disabled={disabled}
//         required={required}
//         error={error}
//         helperText={helperText}
//         displayEmpty
//         InputProps={{
//           classes: {
//             root: styles?.inputRoot,
//             notchedOutline: styles?.inputOutline,
//             focused: styles?.inputFocused,
//           },
//           startAdornment:
//             clearable && value ? (
//               <InputAdornment position="start">
//                 <IconButton
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onClear();
//                   }}
//                 >
//                   <CloseIcon className={styles?.closeItemIcon} />
//                 </IconButton>
//               </InputAdornment>
//             ) : null,
//         }}
//         SelectProps={{
//           displayEmpty: true,
//           renderValue: (val) => {
//             if (!val) {
//               return <span className={styles?.placeholderselect}>{placeholder || `— ${label} —`}</span>;
//             }
//             const selectedOption = options.find((opt) => String(opt.value) === String(val));
//             return selectedOption ? selectedOption.label : '';
//           },
//           classes: {
//             icon: styles?.inputIcon,
//           },
//           open,
//           onOpen: handleOpen,
//           onClose: handleSelectClose,
//         }}
//       >
//         <MenuItem disabled value="">
//           {placeholder || `— ${label} —`}
//         </MenuItem>

//         {options.map((opt) => {
//           const optValue = String(opt.value);
//           const isLoadMore = optValue.startsWith('__load_more');

//           return (
//             <MenuItem
//               key={optValue}
//               value={optValue}
//               // prevent the native focus/selection behavior which can close the menu
//               onMouseDown={isLoadMore ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}
//               onClick={(e) => {
//                 if (isLoadMore) {
//                   // stop default so MUI doesn't immediately close; mark flag so onClose will reopen
//                   e.preventDefault();
//                   e.stopPropagation();
//                   preventCloseRef.current = true;
//                   onChange && onChange({ target: { value: optValue } });
//                   // ensure menu stays open (re-open if MUI tried to close)
//                   setTimeout(() => setOpen(true), 0);
//                 } else {
//                   // normal selection: close the menu
//                   setOpen(false);
//                 }
//               }}
//               onKeyDown={(e) => {
//                 if (isLoadMore && (e.key === 'Enter' || e.key === ' ')) {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   preventCloseRef.current = true;
//                   onChange && onChange({ target: { value: optValue } });
//                   setTimeout(() => setOpen(true), 0);
//                 }
//               }}
//             >
//               {opt.label}
//             </MenuItem>
//           );
//         })}
//       </TextField>

//       {helperText && <FormHelperText>{helperText}</FormHelperText>}
//     </FormControl>
//   );
// }
'use client';
import React, { useState, useRef } from 'react';
import {
  TextField,
  MenuItem,
  FormControl,
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Select({
  name,
  label,
  labelClassName,
  value,
  options = [],
  onChange,
  onBlur,
  error,
  helperText,
  fullWidth = true,
  variant = 'outlined',
  disabled = false,
  required = false,
  placeholder,
  styles,
  clearable = false,
  onClear = () => {},
}) {
  const id = name;
  const [open, setOpen] = useState(false);

  // when true, we want to keep the menu open (used for "load more" items)
  const preventCloseRef = useRef(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // wrapped onClose: if preventCloseRef is set, reopen immediately and reset the flag
  const handleSelectClose = (event) => {
    if (preventCloseRef.current) {
      // reset the flag and reopen (use setTimeout to allow MUI internal close to finish)
      preventCloseRef.current = false;
      setTimeout(() => setOpen(true), 0);
      return;
    }
    handleClose();
  };

  return (
    <FormControl fullWidth={fullWidth} variant={variant} error={error} required={required}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}

      <TextField
        id={id}
        name={name}
        select
        fullWidth
        variant={variant}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        error={error}
        displayEmpty
        InputProps={{
          classes: {
            root: styles?.inputRoot,
            notchedOutline: styles?.inputOutline,
            focused: styles?.inputFocused,
          },
          startAdornment:
            clearable && value ? (
              <InputAdornment position="start">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                >
                  <CloseIcon className={styles?.closeItemIcon} />
                </IconButton>
              </InputAdornment>
            ) : null,
        }}
        SelectProps={{
          displayEmpty: true,
          renderValue: (val) => {
            if (!val) {
              return <span className={styles?.placeholderselect}>{placeholder || `— ${label} —`}</span>;
            }
            const selectedOption = options.find((opt) => String(opt.value) === String(val));
            return selectedOption ? selectedOption.label : '';
          },
          classes: {
            icon: styles?.inputIcon,
          },
          open,
          onOpen: handleOpen,
          onClose: handleSelectClose,
        }}
      >
        <MenuItem disabled value="">
          {placeholder || `— ${label} —`}
        </MenuItem>

        {options.map((opt) => {
          const optValue = String(opt.value);
          const isLoadMore = optValue.startsWith('__load_more');

          return (
            <MenuItem
              key={optValue}
              value={optValue}
              // prevent the native focus/selection behavior which can close the menu
              onMouseDown={isLoadMore ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}
              onClick={(e) => {
                if (isLoadMore) {
                  // stop default so MUI doesn't immediately close; mark flag so onClose will reopen
                  e.preventDefault();
                  e.stopPropagation();
                  preventCloseRef.current = true;
                  onChange && onChange({ target: { value: optValue } });
                  // ensure menu stays open (re-open if MUI tried to close)
                  setTimeout(() => setOpen(true), 0);
                } else {
                  // normal selection: close the menu
                  setOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (isLoadMore && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  e.stopPropagation();
                  preventCloseRef.current = true;
                  onChange && onChange({ target: { value: optValue } });
                  setTimeout(() => setOpen(true), 0);
                }
              }}
            >
              {opt.label}
            </MenuItem>
          );
        })}
      </TextField>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
