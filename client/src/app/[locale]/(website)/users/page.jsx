import dynamic from 'next/dynamic';
import styles from "@/assets/styles/features/users/UsersList.module.scss";

const UsersTable = dynamic(() => import('@/features/user/components/UsersList'), { ssr: false });

export default function Page() {
  return (
      <UsersTable styles={styles} />

  );
}