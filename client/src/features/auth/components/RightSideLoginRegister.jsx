'use client';
import { useTheme } from '@/config/useTheme';
import LoginMap from '@/assets/images/svg/auth/map_signin.svg';
import LoginMapDark from '@/assets/images/svg/auth/map_signin_dark.svg';

export default function ImageLoginComponent({ styles }) {
  const { data: theme } = useTheme();

  console.log('Theme is:', theme);

  return (
    <div className={styles.right}>
      {theme === 'dark' ? (
        <LoginMapDark className={styles.map_image} />
      ) : (
        <LoginMap className={styles.map_image} />
      )}
    </div>
  );
}
