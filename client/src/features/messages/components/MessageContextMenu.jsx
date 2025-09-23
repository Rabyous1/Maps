import React, { useState, MouseEvent } from 'react';
import dayjs from 'dayjs';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { CopyAll as CopyIcon, Info as InfoIcon } from '@mui/icons-material';
import ProfilePicture from './ProfilePicture';

export default function MessageContextMenu({ anchorEl, onClose, message, mode, setMode, styles }) {
  const open = Boolean(anchorEl);
  const isInfo = mode === 'info';

  const copyMessage = () => {
    if (message && navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
    }
    onClose();
  };

  const showInfo = () => setMode('info');

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        className: styles.popoverPaper, 
      }}
    >
      {!isInfo && (
        <MenuList>
          <MenuItem onClick={copyMessage} className={styles.seenMenuItem}>
            <CopyIcon className={styles.seenMenuIcon}/> <p className={styles.seenMenuText}>Copy message</p>
          </MenuItem>
          <MenuItem onClick={showInfo}  className={styles.seenMenuItem}>
            <InfoIcon  className={styles.seenMenuIcon}/> <p className={styles.seenMenuText}>Info</p>
          </MenuItem>
        </MenuList>
      )}

      {isInfo && (
        <div className={styles.seenByMenu}>
          <p className={styles.seenbyTitle}>Seen by</p>

          {message && message.seenBy && message.seenBy.length > 0 ? (
            
            message.seenBy.map(entry => (
              <div key={entry.user.id} className={styles.userSeenRow}>

                <ProfilePicture
                  filename={entry.user.profilePicture?.split('/').pop()}
                  fullName={entry.user.fullName}
                  styles={styles}
                  hasBorder={false}
                  forceGray
                  size="m"
                  className={styles.seenPicture}
                />
                <div className={styles.userSeenInfo}>
                  <p className={styles.userSeenFullname}>{entry.user.fullName}</p>
                  <p className={styles.userSeenTimestamp}>
                    {dayjs(entry.seenAt).format('HH:mm')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noSeenText}>
              No one has seen this message yet.
            </p>
          )}
          <Divider className={styles.divider}/>
          <p className={styles.seenCloseText} onClick={onClose}>Close</p>
        </div>
      )}
    </Popover>
  );
}
