'use client';

import React, { useState } from 'react';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';
import { useOpportunityById } from '../hooks/opportunities.hooks';
import GenericCard from '@/components/ui/surfaces/Card';
import IconClock from '@/assets/icons/dashboard/cards/clock-three.svg';
import IconExpired from '@/assets/icons/opportunities/icon-expired.svg';
import IconFile from '@/assets/icons/opportunities/icon-file.svg';
import IconMoneyBill from '@/assets/icons/opportunities/icon-moneyBill.svg';
import IconWork from '@/assets/icons/dashboard/cards/suitcase.svg';
import IconUrgency from '@/assets/icons/opportunities/icon-urgent.svg';
import IconStatus from '@/assets/icons/opportunities/icon-status.svg';
import IconEye from '@/assets/icons/dashboard/cards/eye.svg';
import IndustryIcon from '@/components/IndustryIcon';
import { formatFullDateUS } from '@/utils/functions';
import { getCountryFlagUrl } from '@/utils/constants';
import OpportunitiesReturnButton from './OpportunitiesReturnButton';
import ResumeApplyDialog from '@/components/ui/feedback/ResumeApplyDialog';


export default function OpportunityDetailsPage({ opportunityId, styles }) {
  const { data: currentUser } = useCurrentUser();
  const { data, isLoading, error } = useOpportunityById(opportunityId);
  const [openDialog, setOpenDialog] = useState(false);
  const handleConfirm = async (resumeId) => {
    try {
      await applyToOpportunity(resumeId);
      alert("✅ Successfully applied!");
    } catch (error) {
      console.error("Error while applying:", error);
      alert("❌ An error occurred while applying. Please try again.");
    }
  };


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading opportunity.</div>;


  return (
    <div className={styles.generalWrapper}>
      <OpportunitiesReturnButton styles={styles} />
      <div className={styles.detailsPageWrapper}>
        <GenericCard styles={styles} className={styles.firstCard}>
          <div className={styles.titleWithRef}>
            <div className={styles.titleAndRef}>
              <h1 className={styles.titleOpp}>{data.title}</h1>
              <span className={styles.ref}>Ref: {data.reference}</span>
            </div>
            {currentUser?.roles === 'Candidat' && (
              <>
                <button
                  className={styles.applyBtn}
                  onClick={() => setOpenDialog(true)}
                >
                  Apply
                </button>
                <ResumeApplyDialog
                  open={openDialog}
                  onClose={() => setOpenDialog(false)}
                  onConfirm={handleConfirm}
                  opportunityId={opportunityId}
                  styles={styles}
                />
              </>
            )}


          </div>


          <div className={styles.infoGroup1}>
            <div className={styles.detailItem}>
              <IndustryIcon industry={data.industry} className={styles.industriesIcons} />
              <span className={styles.firstfieldValue}>{data.industry}</span>
            </div>
            <div className={styles.detailItem}>
              <img
                src={getCountryFlagUrl(data.country)}
                alt={data.country}
                className={styles.countryFlag}
              />
              <span className={styles.firstfieldValue}>{data.country}{data.city.name ? `, ${data.city.name}` : ""}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.firstfieldValue}>
                {data.workMode} | {data.employmentType}
              </span>
            </div>
          </div>

          <div className={styles.infoGroup2}>
            <div className={styles.detailItem}>
              <IconFile className={styles.oppIcons} />
              <span className={styles.fieldTitle}>Contract:</span>
              <span className={styles.fieldValue}>{data.contractType}</span>
            </div>

            <div className={styles.detailItem}>
              <IconStatus className={styles.oppIcons} />
              <span className={styles.fieldTitle}>Status:</span>
              <span className={styles.fieldValue}>{data.status}</span>
            </div>

            <div className={styles.detailItem}>
              <IconUrgency className={styles.oppIcons} />
              <span className={styles.fieldValue}>{data.urgent ? 'Urgent' : 'Not Urgent'}</span>
            </div>

            <div className={styles.detailItem}>
              <IconEye className={styles.oppIcons} />
              <span className={styles.fieldTitle}>Visibility:</span>
              <span className={styles.fieldValue}>{data.visibility}</span>
            </div>

            <div className={styles.detailItem}>
              <IconWork className={styles.oppIcons} />
              <span className={styles.fieldTitle}>Experience Required:</span>
              <span className={styles.fieldValue}>
                {data.minExperience} - {data.maxExperience} years
              </span>
            </div>

            <div className={styles.detailItem}>
              <IconMoneyBill className={styles.oppIcons} />
              <span className={styles.fieldTitle}>Starting Salary:</span>
              <span className={styles.fieldValue}>{data.salaryMinimum} €</span>
            </div>

            <div className={styles.detailItem}>
              <IconClock className={styles.oppIcons} />
              <span className={styles.fieldTitle}>Posting Date:</span>
              <span className={styles.fieldValue}>{formatFullDateUS(data.publisheddate)}</span>
            </div>

            <div className={styles.detailItem}>
              <IconExpired className={styles.oppIcons} />
              <span className={styles.fieldTitle}>Expiration Date:</span>
              <span className={styles.fieldValue}>{formatFullDateUS(data.dateOfExpiration)}</span>
            </div>
          </div>
        </GenericCard>

        <GenericCard styles={styles} className={styles.secondCard}>
          <h2 className={styles.titleDescription}>Job Overview</h2>
          <div
            className={styles.descriptionText}
            dangerouslySetInnerHTML={{ __html: data.jobDescription }}
          />
        </GenericCard>
      </div>
    </div>
  );
}