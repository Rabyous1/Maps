"use client";
import React from 'react';
import Link from 'next/link';
import {
  Button as MuiButton,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';

const GenericButton = ({
  children,
  startIcon,
  endIcon,
  badgeContent,
  showBadge = false,
  size = 'medium',
  //color = 'primary',
  variant = 'contained',
  fullWidth = false,
  disabled = false,
  href,
  onClick,
  type = 'button',
  isIconButton = false,
  icon,
  tooltip,
  className,
}) => {
  const buttonContent = isIconButton ? (
    <IconButton
      size={size}
      //color={color}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {icon}
    </IconButton>
  ) : (
    <MuiButton
      startIcon={startIcon}
      endIcon={endIcon}
      size={size}
      //color={color}
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={className}
    >
      {children}
    </MuiButton>
  );

  const withBadge = showBadge ? (
    <Badge badgeContent={badgeContent} color="error">
      {buttonContent}
    </Badge>
  ) : (
    buttonContent
  );

  const withTooltip = tooltip ? (
    <Tooltip title={tooltip} arrow>
      <span>{withBadge}</span>
    </Tooltip>
  ) : (
    withBadge
  );

  return href ? (
    <Link href={href} passHref legacyBehavior>
      <a style={{ textDecoration: 'none' }}>{withTooltip}</a>
    </Link>
  ) : (
    withTooltip
  );
};

export default GenericButton;
