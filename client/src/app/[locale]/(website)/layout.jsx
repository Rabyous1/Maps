'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '@/assets/styles/features/ClientLayout.module.scss';
import dynamic from 'next/dynamic';
import ProtectedLayoutWrapper from '@/features/auth/components/ProtectedLayoutWrapper';
import { AlertProvider } from '@/context/AlertContext';
import { VideoCallProvider } from '@/features/video-chat/components/VideoCallContext';
const ClientLayout = dynamic(() => import('@/components/layouts/ClientLayout'), { ssr: false });


export default function WebsiteLayout({ children, params }) {

  return (
    <div>
       <AlertProvider>
      <ToastContainer />
      <ProtectedLayoutWrapper locale={params.locale}>
        {(user) => (
          <>
           <VideoCallProvider>
            <ClientLayout styles={styles} user={user}>
              {children}
            </ClientLayout>
            </VideoCallProvider>
          </>
        )}
      </ProtectedLayoutWrapper>
      </AlertProvider>
    </div>
  );
}

																					