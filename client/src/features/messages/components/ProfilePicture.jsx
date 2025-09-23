'use client';
import React from 'react';
import { Avatar, Badge } from '@mui/material';
import { useGetFile } from '@/features/files/hooks/files.hooks';
import { getAvatarClass } from '@/utils/functions';

export default function ProfilePicture({
  filename,
  fullName = "",
  hasBorder = false,
  isOnline = false,
  styles,
  forceGray = false,
  size = 'md', 
}) {
  const { data: imageUrl } = useGetFile(filename || '');

  const initial = fullName.trim().charAt(0).toUpperCase() || '?';

  const dynamicColorClass = !imageUrl
    ? forceGray
      ? styles.avatarGray
      : styles[getAvatarClass(fullName)]
    : '';

  const avatarClass = [
    styles.avatar,
    hasBorder && styles.withBorder,
    !hasBorder && styles.noBorder,
    !imageUrl && styles.initialAvatar,
    dynamicColorClass,
  ]
    .filter(Boolean)
    .join(' ');

  const sizeMap = {
    xs: { size: 24, fontSize: 10 },
    m: { size: 28, fontSize: 13 },
    sm: { size: 33, fontSize: 16 },
    md: { size: 42, fontSize: 21 },
    l: { size: 190, fontSize: 30 },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant={isOnline ? 'dot' : undefined}
      classes={{ dot: styles.onlineBadge }}
      className={!hasBorder ? styles.badgeNoBorder : ''}
    >
      <Avatar
        src={imageUrl || undefined}
        alt={fullName}
        className={avatarClass}
        sx={{
          width: selectedSize.size,
          height: selectedSize.size,
          fontSize: selectedSize.fontSize,
        }}
      >
        {!imageUrl && initial}
      </Avatar>
    </Badge>
  );
}
