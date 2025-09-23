import '@/assets/styles/globals.scss';

export const metadata = {
  title: "Pentabell Maps",
  description: "By Pentabell",
};

import { ReactQueryProvider } from "@/config/react-query-client";
import { cookies } from 'next/headers';
import { SocketProvider } from '@/context/SocketContext';
import { VideoCallProvider } from '@/features/video-chat/components/VideoCallContext';
import { TwoFAProvider } from '@/context/TwoFAContext';

export default function RootLayout({ children }) {
  const cookieStore = cookies();
  const theme = cookieStore.get('theme')?.value;

  return (
    <html lang="en" data-theme={theme}>
      <body><TwoFAProvider>
        <ReactQueryProvider>
          <SocketProvider>
            <VideoCallProvider>
            {children}
            </VideoCallProvider>
          </SocketProvider>
        </ReactQueryProvider>
        </TwoFAProvider>
      </body>
    </html>
  );
}
