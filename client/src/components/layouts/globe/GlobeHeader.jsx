'use client';

import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import styles from '@/assets/styles/layout/Header.module.scss';
import HeaderNotificationMenu from '../HeaderNotificationsMenu';
import { usePathname, useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { useEffect, useState } from 'react';
import GenericButton from '@/components/ui/inputs/Button';
import { useAppRouter } from '@/helpers/redirections';

export default function GlobeHeader({ user }) {
  const { socket } = useSocket();
  const { pushLogin } = useAppRouter();
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
    <header className={`${styles.header} ${styles.headerglobe}`}>
      <div className={styles.content}>
        <div className={styles.headerleft}>
          <h3 className={styles.headerGlobeTitle}>MAPS</h3>
        </div>

        <div className={styles.headerright}>
          <ThemeToggle styles={styles} />
          {user ? (
            <HeaderNotificationMenu
            notifications={latestNotifs}
            hasNew={hasNew}
            onMarkAll={handleMarkAllAsRead}
            onMenuOpen={handleMenuOpen}
            styles={styles}
          />
          ) : (
             <GenericButton className={styles.signInButton} onClick={pushLogin()}>
              Sign In
            </GenericButton>
          )}
        </div>
      </div>
    </header>
  );
}
