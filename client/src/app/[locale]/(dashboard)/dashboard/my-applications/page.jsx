import dynamic from 'next/dynamic';
import styles from '@/assets/styles/features/dashboard/MyApplications.module.scss';
const MyApplications = dynamic(() => import('@/features/dashboard/MyApplications'), { ssr: false });



export default function Page() {
  return (
    <MyApplications styles={styles} />
  )
}
