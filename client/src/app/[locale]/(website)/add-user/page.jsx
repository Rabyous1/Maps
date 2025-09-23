import dynamic from 'next/dynamic';
import styles from "@/assets/styles/features/users/AddUser.module.scss";

const AddUser = dynamic(() => import('@/features/user/components/AddUser'), { ssr: false });

export default function Page() {
  return (

      <AddUser styles={styles}/>
  );
}