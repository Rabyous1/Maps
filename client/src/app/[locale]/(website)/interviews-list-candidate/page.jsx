import styles from "@/assets/styles/features/videoChat/InterviewsList.module.scss";
import dynamic from 'next/dynamic';

const InterviewsList = dynamic(() => import('@/features/video-chat/components/interviews-candidate/InterviewsList.jsx'), { ssr: false });

export default function Page() {
  return (
    <>
      <InterviewsList styles={styles} />
    </>
  );
}
