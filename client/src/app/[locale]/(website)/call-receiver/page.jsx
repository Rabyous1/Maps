
import dynamic from 'next/dynamic';
import styles from '@/assets/styles/features/videoChat/VideoChat.module.scss';

const CallReceiver = dynamic(() => import('@/features/video-chat/components/CallReceiver'), { ssr: false });

export default function Page() {
  return <CallReceiver styles={styles}/>;
}
