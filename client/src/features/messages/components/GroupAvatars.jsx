'use client';
import React from 'react';
import { Badge } from '@mui/material';
import ProfilePicture from './ProfilePicture';

export function GroupAvatars({
  members = [],
  styles,
  onlineUsers = [],
  hasBorder = false,
  currentUserId,
}) {

  const filteredMembers = members.filter(m => m.id !== currentUserId);
  const firstTwo = filteredMembers.slice(0, 2);

  if (firstTwo.length === 0) return null;

  if (firstTwo.length === 1) {
    const m = firstTwo[0];
    return (
      <ProfilePicture
        filename={m.profilePicture?.split('/').pop() || ''}
        fullName={m.fullName}
        styles={styles}
        isOnline={onlineUsers.includes(m.id)}
        hasBorder={hasBorder}
        size="sm"
      />
    );
  }

  return (
    <div className={styles.groupAvatars}>
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      badgeContent={
        <ProfilePicture
          filename={firstTwo[1].profilePicture?.split('/').pop() || ''}
          fullName={firstTwo[1].fullName}
          styles={styles}
          hasBorder={hasBorder}
          size="sm"
        />
      }
      classes={{ badge: styles.groupBadge }}
    >
      <ProfilePicture
        filename={firstTwo[0].profilePicture?.split('/').pop() || ''}
        fullName={firstTwo[0].fullName}
        styles={styles}
        hasBorder={hasBorder}
        size="sm"
      />
    </Badge>
    </div>
  );
}