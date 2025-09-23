import styles from "@/assets/styles/features/my-resumes/MyResumes.module.scss";
import dynamic from 'next/dynamic';

const MyResumes = dynamic(() => import('@/features/files/my-resumes/components/MyResumes'), {
  ssr: false,
});

export default function Page() {

  return <MyResumes styles={styles}/>;
}
