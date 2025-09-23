import styles from "@/assets/styles/features/auth/Login.module.scss";
import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/features/auth/components/login/LoginForm'), { ssr: false });
const FooterLogin = dynamic(() => import('@/features/auth/components/login/FooterLogin'), { ssr: false });
const ImageLoginComponent = dynamic(() => import('@/features/auth/components/RightSideLoginRegister'), { ssr: false });

const SocialMediaButtons = dynamic(() => import('@/features/authSocialMedia/components/SocialMediaButtons'), { ssr: false });


export default function page() {
  return (
    <div className={styles.wrappers}>
      <div className={styles.left}>
        <LoginForm styles={styles} />
        <SocialMediaButtons styles={styles} />
        <FooterLogin styles={styles} />
      </div>
      <ImageLoginComponent styles={styles} />


    </div>
  );
}
