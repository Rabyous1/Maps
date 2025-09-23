'use client';
import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import GenericCard from '@/components/ui/surfaces/Card';
import { NotificationFavoriteOptions, NotificationReadOptions, NotificationTypeConfig } from '@/utils/constants';
import StarIcon from '@/assets/icons/notifications/star-icon.svg';
import StarFilledIcon from '@/assets/icons/notifications/starFilled-icon.svg';
import PreviousIcon from '@/assets/icons/notifications/left-arrow.svg';
import NextIcon from '@/assets/icons/notifications/right-arrow.svg';
import EmptyNotifImage from '@/assets/images/png/notifications/emptyNotifications.png';
import RefreshIcon from '@mui/icons-material/Refresh';

import { formatTimeAgo, groupNotificationsByDate } from '@/utils/functions';
import { Box, IconButton } from '@mui/material';
import Image from 'next/image';
import GenericButton from '@/components/ui/inputs/Button';
import DateRange from '@/components/ui/inputs/DateRangePicker';
import Select from '@/components/ui/inputs/Select';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';

export default function Notifications({ styles }) {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 4;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();


  const [filters, setFilters] = useState({
    isRead: '',
    isFavorite: '',
    type: '',
    startDate: null,
    endDate: null,
  });
   const { data: user } = useCurrentUser();
  const roles = user?.roles ? [user.roles] : [];

  const typeOptions = NotificationTypeConfig
    .filter(opt => opt.visibleTo.some(r => roles.includes(r)))
    .map(({ value, label }) => ({ value, label }));

  useEffect(() => {
    if (!socket) return;

    const handleTogglePref = ({ enabled }) => {
      setNotificationsEnabled(enabled);
    };

    socket.on('notification_toggle_status', handleTogglePref);

    return () => {
      socket.off('notification_toggle_status', handleTogglePref);
    };
  }, [socket]);
  const handleToggleNotifications = () => {
    const newEnabled = !notificationsEnabled;
    setNotificationsEnabled(newEnabled);
    socket.emit('toggle_notifications', { enabled: newEnabled });
  };

  const fetchPage = () => {
    console.log('[fetchPage] filters:', filters);
    socket.emit(
      'get_notifications',
      {
        pageNumber,
        pageSize,
        isRead: filters.isRead,
        isFavorite: filters.isFavorite,
        type: filters.type,
        ...(filters.startDate && { startDate: toISOStringSafe(filters.startDate) }),
        ...(filters.endDate && { endDate: toISOStringSafe(filters.endDate, true) }),
      },
      (ack) => {
        if (ack.status === 'ok') {
          setNotifications(ack.notifications);
          setTotalItems(ack.totalNotifications);
          setTotalPages(ack.totalPages);
        } else {
          console.error('Error fetching notifications', ack.error);
        }
      }
    );

  };

  useEffect(() => {
    fetchPage();
    const handleNew = (notif) => {
      setNotifications(prev => {
        const updated = [notif, ...prev];
        return updated.slice(0, pageSize);
      });
      setTotalItems(prev => prev + 1);
    };
    const handleUpdate = updated => setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
    socket.on('new_notification', handleNew);
    socket.on('notification_updated', handleUpdate);
    const handleAllRead = () => {
      fetchPage();
    };
    socket.on('all_notifications_marked_read', handleAllRead);
    return () => {
      socket.off('new_notification', handleNew);
      socket.off('notification_updated', handleUpdate);
      socket.off('all_notifications_marked_read', handleAllRead);
    };
  }, [socket, pageNumber, filters]);

  const handleMarkAllAsRead = () => {
    socket.emit('mark_all_as_read', {}, (ack) => {
      if (ack.status === 'ok') {
        fetchPage();
      } else {
        console.error('mark_all_as_read failed', ack.error);
      }
    });
  };
  const handleMarkRead = id => {
    socket.emit(
      'mark_notification_read',
      { notificationId: id },
      ack => {
        if (ack.status === 'ok') fetchPage();
        else console.error('Mark read failed', ack.error);
      }
    );
  };
// const handleNotificationClick = (notif) => {
//   socket.emit(
//     'mark_notification_read',
//     { notificationId: notif.id },
//     (ack) => {
//       if (ack.status === 'ok') {
//         fetchPage();
//         const config = NotificationTypeConfig.find(t => t.value === notif.type);
//         if (config?.navigateTo) {
//           router.push(config.navigateTo);
//         }
//         if (cfg?.navigateTo && notif.targetId) {
//           router.push(`${cfg.navigateTo}/${notif.targetId}`);
//         }
//       } else {
//         console.error('Mark read failed', ack.error);
//       }
//     }
//   );
// };
const handleNotificationClick = (notif) => {
  socket.emit(
    'mark_notification_read',
    { notificationId: notif.id },
    (ack) => {
      if (ack.status !== 'ok') {
        console.error('Mark read failed', ack.error);
        return;
      }

      fetchPage();

      const cfg = NotificationTypeConfig.find(t => t.value === notif.type);
      if (!cfg?.navigateTo) {
        return; 
      }

      const path = notif.targetId
        ? `${cfg.navigateTo}/${notif.targetId}`
        : cfg.navigateTo;

      router.push(path);
    }
  );
};

  const handleMarkFavorite = (id, currentFavorite) => {
    socket.emit(
      'mark_notification_favorite',
      { notificationId: id, favorite: !currentFavorite },
      ack => {
        if (ack.status === 'ok') fetchPage();
        else console.error('Mark fav failed', ack.error);
      }
    );
  };

  const onFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  const clearFilters = () => {
    setFilters({ isRead: '', isFavorite: '', type: '', startDate: null, endDate: null });
  };
  const toISOStringSafe = (val, endOfDay = false) => {
    if (!val) return null;
    const date = new Date(val);
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString();
  };



  return (
    <section className={styles.notifSection}>
      <div className={styles.notifHeader}>
        <h2 className={styles.notifTitle}>Notifications ({totalItems})</h2>
        <GenericButton className={styles.markAllAsReadButton} onClick={handleMarkAllAsRead}>
          Mark All As Read
        </GenericButton>
      </div>

      <GenericCard styles={styles} className={styles.cardWrapper}>
        {/* Filters */}
        <div className={styles.filterWrapper}>
          <Select
            name="isRead"
            placeholder="Read"
            value={filters.isRead}
            options={NotificationReadOptions}
            onChange={e => onFilterChange('isRead', e.target.value)}
            clearable
            onClear={() => onFilterChange('isRead', '')}
            styles={styles}
          />
          <Select
            name="isFavorite"
            placeholder="Favorite"
            value={filters.isFavorite}
            options={NotificationFavoriteOptions}
            onChange={e => onFilterChange('isFavorite', e.target.value)}
            clearable
            onClear={() => onFilterChange('isFavorite', '')}
            styles={styles}
          />
          <Select
            name="type"
            placeholder="Type"
            value={filters.type}
            // options={NotificationTypeConfig}
            options={typeOptions}
            onChange={e => onFilterChange('type', e.target.value)}
            clearable
            onClear={() => onFilterChange('type', '')}
            styles={styles}
          />
          <DateRange
            value={{ startDate: filters.startDate, endDate: filters.endDate }}
            onChange={({ startDate, endDate }) => {
              onFilterChange('startDate', startDate);
              onFilterChange('endDate', endDate);
            }}
            placeholder="Date"
            className={styles.datePicker}
          />
          <Box className={styles.actionButtons}>
            <GenericButton
              type="button"
              startIcon={<RefreshIcon className={styles.refreshIcon} />}
              variant="outlined"
              className={styles.clearSearchButton}
              onClick={clearFilters}
            >
              Clear
            </GenericButton>
          </Box>
        </div>

        {/* Notification list or empty */}
        {notifications.length === 0 ? (
          <div className={styles.emptyNotifContainer}>
            <Image
              src={EmptyNotifImage}
              alt="Empty Notifications"
              className={styles.emptyNotifImage}
              priority
            />
            <p className={styles.noNotifTitle}>No Notifications yet</p>
            <p className={styles.noNotifSubTitle}>
              You will see your notifications here
            </p>
          </div>
        ) : (
          Object.entries(groupNotificationsByDate(notifications)).map(
            ([dateLabel, items]) => (
              <div key={dateLabel} className={styles.dateGroup}>
                <p className={styles.dateGroupLabel}>{dateLabel}</p>
                {items.map(notif => {
                    const config = NotificationTypeConfig.find(t => t.value === notif.type);
                    const { Icon, navigateTo } = config || {};
                  return (
                    <div
                      key={notif.id}
                      className={`${styles.notifRow} ${!notif.isRead ? styles.unread : ''
                        }`}
                    >
                      <IconButton
                        onClick={() =>
                          handleMarkFavorite(notif.id, notif.isFavorite)
                        }
                        className={styles.favoriteButton}
                      >
                        {notif.isFavorite ? (
                          <StarFilledIcon className={styles.favoriteIconActive} />
                        ) : (
                          <StarIcon className={styles.favoriteIcon} />
                        )}
                      </IconButton>
                      <div className={styles.notifIconWrapper}>
                        {Icon && <Icon className={styles.notifIcon} />}
                      </div>
                      <div className={`${styles.notifContent} ${!navigateTo ? styles.notClickable : ''}`}
                        onClick={() => {
                          if (navigateTo) handleNotificationClick(notif);
                        }}
                      >
                        <p className={styles.notifText}>{notif.content}</p>
                      </div>
                      {/* <button
                        className={styles.markReadBtn}
                        onClick={() => handleMarkRead(notif.id)}
                        disabled={notif.isRead}
                      >
                        {notif.isRead ? 'Read' : 'Mark as read'}
                      </button> */}
                      <p className={styles.notifTimestamp}>
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <IconButton
              onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
              disabled={pageNumber === 1}
              className={styles.paginationBtn}
            >
              <PreviousIcon className={styles.paginationIcons} />
            </IconButton>
            <span className={styles.paginationText}>
              Page {pageNumber} of {totalPages}
            </span>
            <IconButton
              onClick={() =>
                setPageNumber(p => Math.min(p + 1, totalPages))
              }
              disabled={pageNumber === totalPages}
              className={styles.paginationBtn}
            >
              <NextIcon className={styles.paginationIcons} />
            </IconButton>
          </div>
        )}
      </GenericCard>
    </section>
  );
}
