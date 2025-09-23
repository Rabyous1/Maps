import styles from "@/assets/styles/features/account/Account.module.scss";
import dynamic from 'next/dynamic';

const RoleBasedAccount = dynamic(() => import('@/features/account/components/RoleBasedAccount'), { ssr: false });

export default function Page() {
  return (
    <>
      <RoleBasedAccount styles={styles} />
    </>
  );
}
