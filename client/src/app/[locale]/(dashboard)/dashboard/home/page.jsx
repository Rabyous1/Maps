import dynamic from 'next/dynamic';
import styles from '@/assets/styles/features/dashboard/Home.module.scss';
const RoleBasedDashboard = dynamic(() => import('@/features/dashboard/RoleBasedDashboard'), { ssr: false });


export default function Page() {
  return (
    <RoleBasedDashboard styles={styles}/>
  )
}
