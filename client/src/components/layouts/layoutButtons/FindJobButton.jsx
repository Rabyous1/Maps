'use client';

import React from 'react';
import GenericButton from '../../ui/inputs/Button';
import { useRouter } from 'next/navigation';

export default function FindJobButton({ styles }) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/globe3D');
  };

  return (
    <GenericButton className={styles.customButton} onClick={handleClick}>
      Find a Job
    </GenericButton>
  );
}
