'use client';


import React from 'react'
import GenericButton from '../../ui/inputs/Button'
import { useRouter } from 'next/navigation';

export default function PostJobButton({styles}) {

    const router = useRouter();
    
      const handleClick = () => {
        router.push('/opportunities/add');
      };
    return (
        <GenericButton className={styles.customButton}onClick={handleClick}>
            Post a Job
        </GenericButton>
    )
}
