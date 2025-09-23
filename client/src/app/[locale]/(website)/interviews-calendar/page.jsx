'use client';

import dynamic from 'next/dynamic';
import styles from '@/assets/styles/features/videoChat/Calendar.module.scss';

const Calendar = dynamic(() => import('@/features/video-chat/components/interviews-calendar/Calendar'), { ssr: false });

export default function Page() {
  return <Calendar styles={styles} />;
}
