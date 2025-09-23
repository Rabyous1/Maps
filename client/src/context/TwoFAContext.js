'use client';
import React, { createContext, useContext, useState } from 'react';

const TwoFAContext = createContext();

export const TwoFAProvider = ({ children }) => {
  const [is2FAPending, setIs2FAPending] = useState(false);

  return (
    <TwoFAContext.Provider value={{ is2FAPending, setIs2FAPending }}>
      {children}
    </TwoFAContext.Provider>
  );
};

export const useTwoFA = () => useContext(TwoFAContext);