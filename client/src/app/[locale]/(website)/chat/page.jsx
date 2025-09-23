import styles from "@/assets/styles/features/chat/Chat.module.scss";
import dynamic from 'next/dynamic';

const ChatLayout = dynamic(() => import('@/features/chat/components/ChatLayout'), { ssr: false });

export default function Page() {
  return <ChatLayout styles={styles} />;
}
