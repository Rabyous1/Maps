import styles from "@/assets/styles/features/chat/Chat.module.scss";
import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/features/messages/components/SendMessage'), { ssr: false });

export default function page() {
  return (
      <Chat styles={styles}/>
  );
}
