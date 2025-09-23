import dynamic from 'next/dynamic';
import styles from "@/assets/styles/features/auth/Register.module.scss";

const RegisterForm = dynamic(() => import('@/features/auth/components/register/RegisterForm'), { ssr: false });
const FooterRegister = dynamic(() => import('@/features/auth/components/register/FooterRegister'), { ssr: false });
const SocialMediaButtons = dynamic(() => import('@/features/authSocialMedia/components/SocialMediaButtons'), { ssr: false });
const ImageLoginComponent = dynamic(() => import('@/features/auth/components/RightSideLoginRegister'), { ssr: false });

export default function Page() {
  return (
    <div className={styles.wrappers}>
      <div className={styles.left}>
      <RegisterForm styles={styles} />
      <SocialMediaButtons styles={styles} />
      <FooterRegister styles={styles} />
      </div>
      <ImageLoginComponent styles={styles} />
    </div>
   
  );
}
