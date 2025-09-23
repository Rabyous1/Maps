// components/ui/ThemeArrowIcon.jsx

import React from 'react';
import ArrowRightLight from '@/assets/icons/globe3D/filtremenu/light/arrow-cercle-right-light.svg';
import ArrowRightDark from '@/assets/icons/globe3D/filtremenu/dark/arrow-cercle-right.svg';
import ArrowLeftLight from '@/assets/icons/globe3D/filtremenu/light/arrow-cercle-left-light.svg';
import ArrowLeftDark from '@/assets/icons/globe3D/filtremenu/dark/arrow-cercle-left.svg';

import { useTheme } from '@/features/globe3D/hooks/useTheme';

export default function ThemeArrowIcon({ direction = 'right', className = '', ...props }) {
  const theme = useTheme();

  const icons = {
    right: {
      light: <ArrowRightLight className={className} {...props} />,
      dark: <ArrowRightDark className={className} {...props} />,
    },
    left: {
      light: <ArrowLeftLight className={className} {...props} />,
      dark: <ArrowLeftDark className={className} {...props} />,
    },
  };

  return icons[direction]?.[theme] || null;
}
