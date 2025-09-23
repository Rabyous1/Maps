import dynamic from 'next/dynamic';
import styles from "@/assets/styles/features/auth/Password.module.scss";

const ResetPassword = dynamic(() => import('@/features/auth/components/forgotPassword/ResetPassword'), { ssr: false });

export default function page() {
  return (
    <div className={styles.container}>
        <ResetPassword styles={styles} />
      </div>
  );
}
