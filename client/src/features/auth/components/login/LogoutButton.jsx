'use client';

import React from 'react';
import { ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { useLogout } from '@/features/auth/hooks/auth.hooks';
import { frontUrls } from '@/utils/front-urls';
import Logout_icon from '@/assets/icons/dashboard/icon-logout.svg';


export default function LogoutButton({ open, mobileOpen, styles }) {
  const { mutate: logout, isLoading } = useLogout();

  const handleLogout = () => {
    logout();
    window.location.href = frontUrls.login;
  };

  return (
    <Tooltip
      title={!open && !mobileOpen ? 'Logout' : ''}
      placement="right"
      arrow
    >
      <ListItem
        button
        className={styles.menuItem}
        onClick={handleLogout}
        disabled={isLoading}
      >
        <ListItemIcon className={styles.logoutIcon}>
          <Logout_icon alt="Logout icon"/>
        </ListItemIcon>
        <ListItemText
          disableTypography
          className={styles.logoutItemText}
          primary={<span className={styles.text}>Logout</span>}
        />
      </ListItem>
    </Tooltip>
  );
}
