import styles from "@/assets/styles/features/opportunities/Opportunities.module.scss";
import dynamic from 'next/dynamic';

const Opportunities = dynamic(() => import('@/features/opportunities/components/Opportunities'), { ssr: false });

export default function Page() {
  return <Opportunities styles={styles} />;
}
