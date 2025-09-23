'use client';

import dynamic from 'next/dynamic';
import styles from '@/assets/styles/features/cv-video/CvVideo.module.scss';

const CVVideoForm = dynamic(() => import('@/features/cv-video/components/CVVideoForm'), { ssr: false });

export default function Page() {
  return <CVVideoForm styles={styles} />;
}
