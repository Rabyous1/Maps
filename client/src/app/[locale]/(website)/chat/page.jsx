import styles from "@/assets/styles/features/chat/Chat.module.scss";
import dynamic from 'next/dynamic';

// Utiliser le composant Messages existant
const MessagesLayout = dynamic(() => import('@/features/messages/components/MessageThread'), { ssr: false });

export default function Page() {
  return (
    <div className={styles.chatContainer}>
      <MessagesLayout />
    </div>
  );
}
