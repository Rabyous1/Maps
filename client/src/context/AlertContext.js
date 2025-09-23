// "use client"
// import React, { createContext, useContext, useState } from 'react';

// const AlertContext = createContext();

// export const useAlert = () => {
//   return useContext(AlertContext);
// };

// export const AlertProvider = ({ children }) => {
//   const [alertOpen, setAlertOpen] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertSeverity, setAlertSeverity] = useState('info');

//   const openAlert = (message, severity = 'info') => {
//     setAlertMessage(message);
//     setAlertSeverity(severity);
//     setAlertOpen(true);
//   };

//   const closeAlert = () => {
//     setAlertOpen(false);
//   };

//   return (
//     <AlertContext.Provider value={{ alertOpen, alertMessage, alertSeverity, openAlert, closeAlert }}>
//       {children}
//     </AlertContext.Provider>
//   );
// };
// context/AlertContext.js
'use client';

import React, { createContext, useContext } from 'react';
import { toast } from 'react-toastify';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const openAlert = (message, severity = 'info') => {
    switch (severity) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warn':
        toast.warn(message);
        break;
      default:
        toast.info(message);
        break;
    }
  };

  return (
    <AlertContext.Provider value={{ openAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
