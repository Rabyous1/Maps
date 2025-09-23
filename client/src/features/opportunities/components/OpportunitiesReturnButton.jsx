import GenericButton from '@/components/ui/inputs/Button'
import ReturnIcon from "@/assets/icons/actions/return-icon.svg"
import { useBackFromOpportunityDetails } from '@/helpers/redirections';
import React from 'react'

export default function OpportunitiesReturnButton({styles}) {
    const handleBack = useBackFromOpportunityDetails();

  return (
    <div className={styles.headerActions}>
          <GenericButton
            onClick={handleBack}
            startIcon={<ReturnIcon className={styles.returnIcon} />}
            className={styles.returnButton}
          >
            Go Back
          </GenericButton>
        </div>
  )
}
