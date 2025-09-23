'use client';

import React from 'react';
import ProtectedLayoutWrapper from '@/features/auth/components/ProtectedLayoutWrapper';
import ClientLayout from '@/components/layouts/ClientLayout';
import styles from '@/assets/styles/features/ClientLayout.module.scss';

export default function DashboardLayout({ children, params }) {
  return (
    <ProtectedLayoutWrapper locale={params.locale}>
      {user => (
        <ClientLayout styles={styles} user={user}>
          {children}
        </ClientLayout>
      )}
    </ProtectedLayoutWrapper>
  );
}
