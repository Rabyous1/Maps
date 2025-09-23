'use client';

import React, { useState, useEffect, memo } from 'react';
import { useSocket } from '@/context/SocketContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import FindJobButton from './layoutButtons/FindJobButton';
import PostJobButton from './layoutButtons/PostJobButton';
import GenericCard from '../ui/surfaces/Card';
import HeaderNotificationMenu from './HeaderNotificationsMenu';
import ProfilePicture from '@/features/messages/components/ProfilePicture';
import { usePathname, useRouter } from 'next/navigation';
import { IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import styles from '@/assets/styles/layout/Header.module.scss';

function Header({ fullName, avatarUrl = null, setMobileOpen, mobileOpen, isCandidat = false, isRecruiter = false }) {
  const { socket } = useSocket();
  const router = useRouter();
  const [latestNotifs, setLatestNotifs] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const pageSize = 4;
  const pathname = usePathname();


  useEffect(() => {
    if (!socket) return;

    socket.emit('get_notifications', { pageNumber: 1, pageSize }, (ack) => {
      if (ack.status === 'ok') {
        setLatestNotifs(ack.notifications);
        setHasNew(ack.hasNewNotifications || false);
      } else {
        console.error('get_notifications error', ack.error);
      }
    });

    const handleNew = (notif) => {
      setLatestNotifs((prev) => [notif, ...prev].slice(0, pageSize));
      setHasNew(true);
    };

    socket.on('new_notification', handleNew);
    return () => socket.off('new_notification', handleNew);
  }, [socket]);

  const handleMenuOpen = () => {
    if (!socket) return;
    socket.emit('notifications_menu_opened', {}, (ack) => {
      if (ack.status !== 'ok') {
        console.error('notifications_menu_opened failed', ack.error);
      }
    });
    setHasNew(false);
  };

  const handleMarkAllAsRead = () => {
    socket.emit('mark_all_as_read', {}, (ack) => {
      if (ack.status !== 'ok') {
        console.error('mark_all_as_read failed', ack.error);
        return;
      }

      setLatestNotifs((prevNotifs) =>
        prevNotifs.map((n) => ({ ...n, isRead: true }))
      );

      setHasNew(false);
    });
  };

  useEffect(() => {
    if (pathname === '/notifications' && hasNew) {
      setHasNew(false);
    }
  }, [pathname, latestNotifs]);



  return (
    <GenericCard styles={styles}>
      <div className={styles.content}>
        <div className={styles.headerleft}>
          <div className={styles.mobileToggle}>
            <IconButton onClick={() => setMobileOpen(!mobileOpen)}>
              <MenuIcon />
            </IconButton>
          </div>
          <Typography component="h1" className={styles.headerTitle}>
            Hello, {fullName}
          </Typography>
        </div>

        <div className={styles.headerright}>
          <ThemeToggle styles={styles} />

          <HeaderNotificationMenu
            notifications={latestNotifs}
            hasNew={hasNew}
            onMarkAll={handleMarkAllAsRead}
            onMenuOpen={handleMenuOpen}
            styles={styles}
          />

          <ProfilePicture
            filename={avatarUrl?.split('/').pop()}
            fullName={fullName}
            styles={styles}
            isOnline
            hasBorder
            forceGray
          />

          {isCandidat && <FindJobButton styles={styles} />}
          {isRecruiter && <PostJobButton styles={styles} />}
        </div>
      </div>
    </GenericCard>
  );
}

export default memo(Header);
