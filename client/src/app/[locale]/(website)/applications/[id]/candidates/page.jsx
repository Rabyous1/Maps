import dynamic from "next/dynamic";
import styles from "@/assets/styles/features/applications/Candidates.module.scss";

const CandidatesTable = dynamic(
  () => import("@/features/applications/components/candidatesList/CandidatesTable"),{ ssr: false });

export default function Page({ params }) {
  const opportunityId = params.id;

  return (
    <CandidatesTable
      styles={styles}
      opportunityId={opportunityId}
    />
  );
}
