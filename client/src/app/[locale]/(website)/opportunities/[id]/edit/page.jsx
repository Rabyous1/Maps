import styles from "@/assets/styles/features/opportunities/OpportunitiesDetailsPageEdit.module.scss";
import dynamic from "next/dynamic";

const OpportunityEditPage = dynamic(() =>
  import("@/features/opportunities/components/OpportunityEditPage"), {
    ssr: false,
  }
);

export default function Page({ params }) {
  const { id } = params;
  return <OpportunityEditPage opportunityId={id} styles={styles} />;
}
