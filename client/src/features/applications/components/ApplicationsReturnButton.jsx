import React from 'react';
import ReturnIcon from "@/assets/icons/actions/return-icon.svg";
import { useAppRouter } from '@/helpers/redirections';
import GenericButton from '@/components/ui/inputs/Button';

export default function ApplicationsReturnButton({ styles }) {
  const { pushApplicantions } = useAppRouter();

  return (
    <div className={styles.headerActions}>
      <GenericButton
        onClick={pushApplicantions}
        startIcon={<ReturnIcon className={styles.returnIcon} />}
        className={styles.returnButton}
      >
        Go Back
      </GenericButton>
    </div>
  );
}
