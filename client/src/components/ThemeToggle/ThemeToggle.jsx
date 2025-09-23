'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import Icondarkmode from '@/assets/icons/header/icon-dark-mode.svg';
import Iconlightmode from '@/assets/icons/header/icon-light-mode.svg';


const getInitialTheme = () => {
  if (typeof document === 'undefined') return 'dark';
  const match = document.cookie.match(/(^| )theme=([^;]+)/);
  if (match) return match[2];
  return document.documentElement.getAttribute('data-theme') || 'dark';
};

const setThemeCookieAndAttribute = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}`;
};

const ThemeToggle = ({ styles }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeCookieAndAttribute(newTheme);
    setTheme(newTheme);
  };

  return (
    <Box
      className={styles.themeToggle}
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === 'dark'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') toggleTheme();
      }}
    >
      <div className={`${styles.slider} ${theme === 'dark' ? styles.right : styles.left}`} />
      <div className={`${styles.icon} ${theme !== 'dark' ? styles.active : ''}`}>
        <Iconlightmode alt="lightModeIcon" />
      </div>
      <div className={`${styles.icon} ${theme === 'dark' ? styles.active : ''}`}>
        <Icondarkmode alt="darkModeIcon" />
      </div>
    </Box>
  );
};

export default ThemeToggle;
