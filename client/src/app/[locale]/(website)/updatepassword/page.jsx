import styles from "./page.module.css";
import dynamic from 'next/dynamic';

const UpdatePasswordForm = dynamic(() => import('@/features/settings/components/SettingsDialogsContent'), { ssr: false });

export default function Page() {
  return (
    <div className={styles.container}>
      <UpdatePasswordForm styles={styles} />
    </div>
  );
}
