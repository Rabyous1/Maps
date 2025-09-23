
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const GlobePin = dynamic(() => import('@/features/globe3D/components/GlobePin/GlobePin'), { ssr: false });

export default function Page() {

  return (
    <div className={styles.pageContainer}>
      <GlobePin />
    </div>
  );
}
