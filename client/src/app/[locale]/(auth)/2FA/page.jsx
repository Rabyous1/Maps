import dynamic from 'next/dynamic';
import styles from "@/assets/styles/features/auth/2FA.module.scss";

const VerifyOtp = dynamic(() => import('@/features/auth/components/2FA/VerificationCode'), { ssr: false });

export default function page() {
  return (
    <div className={styles.container}>
        <VerifyOtp styles={styles} />
      </div>
  );
}
