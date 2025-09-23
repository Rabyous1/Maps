import React, { useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Box, Typography, Button, Divider } from '@mui/material';
import Notification_icon from '@/assets/icons/header/icon-notification.svg';
import { NotificationTypeConfig } from '@/utils/constants';
import { useAppRouter } from '@/helpers/redirections';
import NotificationActivatedIcon from '@/assets/icons/header/icon-notification.svg';
import NotificationDeactivatedIcon from '@/assets/icons/header/icon-noNotification.svg';

export default function HeaderNotificationMenu({
  notifications = [],
  hasNew = false,
  onMarkAll,
  onItemClick,
  onMenuOpen,
  styles,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const open = Boolean(anchorEl);
  const { pushNotifications } = useAppRouter();

  const handleClick = (e) => {
    onMenuOpen();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  const maxToShow = notifications.slice(0, 4);

  const toggleNotificationsEnabled = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  return (
    <>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        variant="dot"
        color={hasNew ? 'error' : 'default'}
        className={styles.notificationBadge}
        invisible={!hasNew || !notificationsEnabled || open}
      >

        <IconButton
          onClick={handleClick}
          className={styles.bellButton}
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Notification_icon className={styles.notificationIcon} />
        </IconButton>
      </Badge>

      <Menu
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ className: styles.menuPaperWithArrow, elevation: 0 }}
      >
        <Box className={styles.menuHeader}>
          <Typography className={styles.menuTitle}>Notifications</Typography>
          <div className={styles.menuHeaderRight}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleNotificationsEnabled();
              }}
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? (
                <NotificationActivatedIcon className={styles.activatedNotificationIcon} />
              ) : (
                <NotificationDeactivatedIcon className={styles.deactivatedNotificationIcon} />
              )}
            </IconButton>
            <Typography
              onClick={(e) => { e.stopPropagation(); onMarkAll(); }}
              className={styles.markAllAsReadText}
            >
              Mark all as read
            </Typography>
          </div>
        </Box>

        <Divider className={styles.divider} />

        {/* {maxToShow.map((notif, idx) => {
          const cfg = NotificationTypeConfig.find(c => c.value === notif.type);
          const Icon = cfg?.Icon;
          return (
            <React.Fragment key={notif.id || idx}>
              <MenuItem
                onClick={() => { onItemClick?.(notif); handleClose(); }}
                className={`${styles.menuItemRead} ${!notif.isRead ? styles.menuItemunread : ''}`}>
                <div className={styles.menuItemIconWrapper}>{Icon && <Icon className={styles.menuItemIcon} />}</div>
                <div className={styles.menuItemContentWrapper}>
                  <p className={styles.menuItemText}>{notif.content}</p>
                  {!notif.isRead && <span className={styles.unreadDot} />} 
                </div>
              </MenuItem>
              <Divider className={styles.divider} />
            </React.Fragment>
          );
        })} */}
        {maxToShow.length === 0 ? (
          <><Typography

            className={styles.noNotificationsText}
          >
            You have no notifications.
          </Typography>
            <Divider className={styles.divider} /></>

        ) : (
          maxToShow.map((notif, idx) => {
            const cfg = NotificationTypeConfig.find(c => c.value === notif.type);
            const Icon = cfg?.Icon;
            return (
              <React.Fragment key={notif.id || idx}>
                <MenuItem
                  onClick={() => {
                    onItemClick?.(notif);
                    handleClose();
                  }}
                  className={`${styles.menuItemRead} ${!notif.isRead ? styles.menuItemunread : ''}`}
                >
                  <div className={styles.menuItemIconWrapper}>{Icon && <Icon className={styles.menuItemIcon} />}</div>
                  <div className={styles.menuItemContentWrapper}>
                    <p className={styles.menuItemContentText}>{`${notif.content}`.slice(0, 30)}{notif.content.length > 30 && '…'}</p>
                    {!notif.isRead && <span className={styles.unreadDot} />}
                  </div>
                </MenuItem>
                <Divider className={styles.divider} />
              </React.Fragment>
            );
          })
        )}

        <Box className={styles.menuFooter}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              pushNotifications();
              handleClose();
            }}
            className={styles.seeAllButton}
          >
            See All
          </Button>
        </Box>
      </Menu>
    </>
  );
}
