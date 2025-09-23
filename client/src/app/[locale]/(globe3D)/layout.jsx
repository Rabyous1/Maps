'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from '@/assets/styles/layout/GlobeLayout.module.scss';
import dynamic from 'next/dynamic';

import ProtectedLayoutWrapper from '@/features/auth/components/ProtectedLayoutWrapper';

const GlobeLayout = dynamic(() => import('@/components/layouts/globe/GlobeLayout'), {
  ssr: false,   
});

export default function GlobeLayoutWrapper({ children, params }) {

  return (
    <div>
      <ToastContainer />
      <ProtectedLayoutWrapper locale={params.locale}>
        {(user) => (
          <GlobeLayout styles={styles} user={user}>
            <>{children}</>
          </GlobeLayout>
        )}
      </ProtectedLayoutWrapper>
    </div>
  );
}
