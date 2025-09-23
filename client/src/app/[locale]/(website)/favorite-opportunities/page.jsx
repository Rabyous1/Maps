'use client';

import dynamic from 'next/dynamic';
import styles from '@/assets/styles/features/opportunities/FavoritesOpportunities.module.scss';

const FavoriteOpportunities = dynamic(() => import('@/features/opportunities/components/favoriteOpportunities/FavoriteOpportunities'), { ssr: false });

export default function Page() {
  return <FavoriteOpportunities styles={styles} />;
}