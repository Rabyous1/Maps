'use client';

import React, { useState } from 'react';
import GenericCard from '@/components/ui/surfaces/Card';
import OpportunitiesByContractTypeChart from './recruiterDashboard/components/charts/OpportunitiesByContractTypeChart';
import OpportunitiesByEmploymentTypeChart from './recruiterDashboard/components/charts/OpportunitiesByEmploymentTypeChart';
import OpportunitiesByWorkModeChart from './recruiterDashboard/components/charts/OpportunitiesByWorkModeChart';
import OpportunitiesByVisibilityChart from './recruiterDashboard/components/charts/OpportunitiesByVisibilityChart';
import OpportunitiesByTypeChart from './recruiterDashboard/components/charts/OpportunitiesByTypeChart';
import OpportunitiesByJobStatusChart from './recruiterDashboard/components/charts/OpportunitiesByJobStatusChart';
import ApplicationsByStatusChart from './recruiterDashboard/components/charts/ApplicationsByStatusChart';
import CandidatesByProfileStatusChart from './recruiterDashboard/components/charts/CandidatesByProfileStatusChart';
import ApplicantsPerOpportunityChart from './recruiterDashboard/components/charts/ApplicantsPerOpportunityChart';
import { useDashboard } from './hooks/dashboard.hooks';
import DateRange from '@/components/ui/inputs/DateRangePicker';
import ExperienceByStatusChart from './recruiterDashboard/components/charts/AverageExperienceRadialChart';


export default function RecruiterDashboard({ styles }) {
   const [range, setRange] = useState({
     startDate: null,
     endDate: null,
   });
 
   const { data, isLoading, error } = useDashboard(
     { from: range.startDate, to: range.endDate },
     {
       keepPreviousData: true,
     }
   );
  const handleDateChange = ({ startDate, endDate }) => {
    setRange({ startDate, endDate });
  };
  if (isLoading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error loading dashboard</p>;

  return (
       <><div className={styles.dashboardHeader}>
      <h2 className={styles.dashboardTitle}>Recruiter Dashboard</h2>
      <DateRange
        value={range}
        onChange={handleDateChange}
        placeholder="Filter by date…"
        className={styles.datePicker} />
    </div>
    <div className={styles.cardsGridContent}>
    <div className={styles?.cardsGrid}>

        <GenericCard title="Opportunities by Contract Type" styles={styles}>
          <OpportunitiesByContractTypeChart data={data.opportunitiesByContractType} />
        </GenericCard>

        <GenericCard title="Opportunities by Employment Type" styles={styles}>
          <OpportunitiesByEmploymentTypeChart data={data.opportunitiesByEmploymentType} />
        </GenericCard>

        <GenericCard title="Opportunities by Work Mode" styles={styles}>
          <OpportunitiesByWorkModeChart data={data.opportunitiesByWorkMode} />
        </GenericCard>

        <GenericCard title="Opportunities by Visibility" styles={styles}>
          <OpportunitiesByVisibilityChart data={data.opportunitiesByVisibility} />
        </GenericCard>

        <GenericCard title="Opportunities by Type" styles={styles}>
          <OpportunitiesByTypeChart data={data.opportunitiesByType} />
        </GenericCard>

        <GenericCard title="Opportunities by Job Status" styles={styles}>
          <OpportunitiesByJobStatusChart data={data.opportunitiesByJobStatus} />
        </GenericCard>

        <GenericCard title="Applications by Status" styles={styles}>
          <ApplicationsByStatusChart data={data.applicationsByStatus} styles={styles}/>
        </GenericCard>

        <GenericCard title="Candidates by Profile Status" styles={styles}>
          <CandidatesByProfileStatusChart data={data.candidatesByProfileStatus} styles={styles}/>
        </GenericCard>

        <GenericCard title="Applicants per Opportunity" styles={styles}>
          <ApplicantsPerOpportunityChart data={data.applicantsPerOpportunity} />
        </GenericCard>

        <GenericCard title="Average Experience Overall" styles={styles} className={styles.fullRow}>
          <ExperienceByStatusChart
            averageExperienceOverall={data.averageExperienceOverall}
            averageExperienceByStatus={data.averageExperienceByStatus}
            styles={styles}
          />

        </GenericCard>
      </div></div></>
  );
}