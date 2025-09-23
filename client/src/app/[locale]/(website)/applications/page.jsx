import styles from "@/assets/styles/features/applications/Applications.module.scss";
import dynamic from 'next/dynamic';

const Applications = dynamic(() => import('@/features/applications/components/Applications'), { ssr: false });

export default function Page() {
  return <Applications styles={styles} />;
}
