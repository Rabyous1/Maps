'use client';

import React, { useState } from 'react';
import { useDashboard } from './hooks/dashboard.hooks';
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ProfileCompletenessNeedleChart from './candidateDashboard/components/charts/ProfileCompletenessNeedleChart';
import CommunicationEngagementChart from './candidateDashboard/components/charts/CommunicationEngagementChart';
import FavoritesDonutChart from './candidateDashboard/components/charts/FavoritesDonutChart';
import SimpleStatusBarChart from './candidateDashboard/components/charts/ApplicationsByStatusChart';
import GenericCard from '@/components/ui/surfaces/Card';
import DateRange from '@/components/ui/inputs/DateRangePicker';
import ApplicationsByInterestChart from './candidateDashboard/components/charts/ApplicationsByInterestChart';

const COLORS = ['#797EFF', '#343C70', '#6A7D96', '#EED600', '#FFD166', '#b71c1c', '#dc3545'];

export default function CandidateDashboard({ styles }) {
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

  const resumeUploadsData = [
    { name: 'Document Resume', value: data.resumeUploads.docCv },
    { name: 'Video Resume', value: data.resumeUploads.video },
  ];


  return (
    <>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Candidate Dashboard</h2>
        <DateRange
          value={range}
          onChange={handleDateChange}
          placeholder="Filter by date…"
          className={styles.datePicker}
        />
      </div>
    <div className={styles.cardsGridContent}>

      <div className={styles.cardsGrid}>

        <GenericCard title="Profile Completeness" styles={styles} className={styles.profileCompletness}>

          <ProfileCompletenessNeedleChart value={data.profileCompletenessPercentage} styles={styles} />
        </GenericCard>

        <GenericCard title="Resumes" styles={styles} className={styles.resumes}>
          <ResponsiveContainer width="100%" height={250}>
            
            <PieChart>
              <Pie
                data={resumeUploadsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                onClick={(entry) => alert(`Clicked: ${entry.name}`)}
              >
                {resumeUploadsData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className={styles.resumeStatsHeader}>
            <p className={styles.resumeStat}>
              Avg. Time Between Uploads :
              <strong> {data.resumeUploads?.avgTimeBetweenUploads?.toFixed(1)} days</strong>
              {console.log(resumeUploadsData)}
            </p>
          </div>
        </GenericCard>



        <GenericCard title="Communication Engagement" styles={styles} className={styles.communicationEngagement}>

          <CommunicationEngagementChart engagementLevel={data.communicationEngagementLevel} styles={styles} />
        </GenericCard>

        <GenericCard title="Applications & Acceptance Rate" styles={styles} className={styles.applicationsCard}>
          <SimpleStatusBarChart data={data.applicationsByStatus} styles={styles} />
        </GenericCard>

        <GenericCard title="Favorite Applications" styles={styles} className={styles.favoriteApplications}>
          <FavoritesDonutChart
            favoritesCount={data.favoritesCount}
            totalApplications={data.totalApplications}
            styles={styles}
          />
        </GenericCard>
        <GenericCard title="Recruiter Interest To Your" styles={styles} className={styles.recruiterInterest}>
          <ApplicationsByInterestChart data={data.applicationsByInterest} />
        </GenericCard>
      </div>
      </div>
    </>
  );
}
