'use client';

import React from 'react';
import { useTheme } from '@/features/globe3D/hooks/useTheme';

import ArrowIconLeftLight from '@/assets/icons/globe3D/filtremenu/light/arrow-cercle-left-light.svg';
import ArrowIconLeftDark from '@/assets/icons/globe3D/filtremenu/dark/arrow-cercle-left.svg';

import ArrowIconRightLight from '@/assets/icons/globe3D/filtremenu/light/arrow-cercle-right-light.svg';
import ArrowIconRightDark from '@/assets/icons/globe3D/filtremenu/dark/arrow-cercle-right.svg';

import styles from '@/features/globe3D/components/FilterMenu/FilterToogleButton.module.scss';

export default function FilterToggleButton({ open, onClick }) {
  const theme = useTheme();

  const isDark = theme === 'dark';

  const ArrowIcon = open
    ? isDark ? ArrowIconLeftDark : ArrowIconLeftLight
    : isDark ? ArrowIconRightDark : ArrowIconRightLight;

  return (
    <div
      className={`${styles.toggleWrapper} ${open ? styles.open : styles.closed}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={open ? 'Close filter sidebar' : 'Open filter sidebar'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <ArrowIcon />
      {!open && <span className={styles.label}>Show Filter</span>}
    </div>
  );
}
