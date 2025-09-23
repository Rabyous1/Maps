import styles from "@/assets/styles/features/opportunities/OpportunityDetailsPage.module.scss";
import dynamic from 'next/dynamic';

const OpportunityDetailsPage = dynamic(() => import('@/features/opportunities/components/OpportunityDetailsPage'), {
  ssr: false,
});

export default function Page({ params }) {
  const { id } = params; 

  return <OpportunityDetailsPage opportunityId={id} styles={styles}/>;
}
