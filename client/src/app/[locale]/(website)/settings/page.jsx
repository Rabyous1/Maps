import dynamic from 'next/dynamic';
import styles from "@/assets/styles/features/settings/Settings.module.scss";

const Settings = dynamic(() => import('@/features/settings/components/Settings'), { ssr: false });

export default function page() {
  return (
      <Settings styles={styles}/>
  );
}
