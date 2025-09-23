import styles from "@/assets/styles/features/opportunities/AddOpportunity.module.scss";
import dynamic from 'next/dynamic';

const AddOpportunity = dynamic(() => import('@/features/opportunities/components/addOpportunity/AddOpportunity'), { ssr: false });

export default function Page() {
  return <AddOpportunity styles={styles} />;
}
