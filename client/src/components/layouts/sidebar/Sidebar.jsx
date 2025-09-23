'use client';
import React, { useMemo } from 'react';
import {
  Drawer
} from '@mui/material';

import { useRouter, usePathname } from 'next/navigation';

import styles from '@/assets/styles/layout/Sidebar.module.scss';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';
import { adminMenu, candidatMenu, recruteurMenu } from '@/helpers/MenuList';
import SidebarContent from './SidebarContent';



export default function Sidebar({ open, setOpen, mobileOpen, setMobileOpen }) {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    if (user?.roles?.includes('Admin')) return adminMenu;
    if (user?.roles?.includes('Recruteur')) return recruteurMenu;
    if (user?.roles?.includes('Candidat')) return candidatMenu;
    return [];
  }, [user]);

  const isCandidate = user?.roles?.includes('Candidat');

  const desktopToggle = () => setOpen(!open);
  const mobileToggle = () => setMobileOpen(!mobileOpen);

  return (
    <>
      <Drawer
        variant="permanent"
        className={`${styles.drawer} ${!open ? styles.collapsed : ''} ${styles.desktopDrawer}`}
        classes={{ paper: `${styles.paper} ${!open ? styles.collapsed : ''}` }}
      >
        <SidebarContent
          {...{
            open,
            mobileOpen,
            desktopToggle,
            mobileToggle,
            menuItems,
            pathname,
            router,
            setMobileOpen,
            isCandidate,
            profileCompleteness: user?.profileCompleteness ?? 0,
            styles,
          }}
        />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={mobileToggle}
        ModalProps={{ keepMounted: true }}
        className={styles.mobileDrawer}
        classes={{ paper: styles.mobilePaper }}
      >
        <div className={styles.contentWrapper}>
          <SidebarContent
            {...{
              open,
              mobileOpen,
              desktopToggle,
              mobileToggle,
              menuItems,
              pathname,
              router,
              setMobileOpen,
               profileCompleteness: user?.profileCompleteness ?? 0,
              styles,
            }}
          />
        </div>
      </Drawer>
    </>
  );
}
