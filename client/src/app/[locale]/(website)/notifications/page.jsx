import styles from "@/assets/styles/features/notifications/Notifications.module.scss";
import dynamic from 'next/dynamic';

const Notifications = dynamic(() => import('@/features/notifications/components/Notifications'), { ssr: false });

export default function Page() {
  return (
    <>
      <Notifications styles={styles} />
    </>
  );
}
