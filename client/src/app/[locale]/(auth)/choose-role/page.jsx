import styles from "@/assets/styles/features/auth/ChooseRole.module.scss";
import dynamic from 'next/dynamic';

const ChooseRole = dynamic(() => import('@/features/auth/components/chooseRole/ChooseRole'), { ssr: false });

export default function Page() {
  return <ChooseRole styles={styles} />;
}

