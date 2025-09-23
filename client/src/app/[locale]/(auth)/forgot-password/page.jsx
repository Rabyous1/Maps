import styles from "@/assets/styles/features/auth/Password.module.scss";
import dynamic from "next/dynamic";

const ForgotPassword = dynamic(() => import('@/features/auth/components/forgotPassword/ForgotPassword'), { ssr: false });


export default function Page() {
  return (
    <div className={styles.container}>
        <ForgotPassword styles={styles} />
      </div>
  );
}
