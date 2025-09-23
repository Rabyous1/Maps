import styles from '@/assets/styles/features/videoChat/VideoChat.module.scss';

import dynamic from "next/dynamic";

const VideoChat = dynamic(() => import('@/features/video-chat/components/VideoChat'), {
  ssr: false,
});

export default function Page() {
  // const { id } = params; 

  return <VideoChat styles={styles} />;
}
