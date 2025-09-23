'use client';

import StatCard from './StatCard';
import IconChecked from '@/assets/icons/dashboard/cards/check-circle.svg';
import IconRejected from '@/assets/icons/dashboard/cards/rejected.svg';
import IconClock from '@/assets/icons/dashboard/cards/clock-three.svg';
import IconWork from '@/assets/icons/dashboard/cards/suitcase.svg';


export default function StatsGrid({ styles, stats }) {
  const safeStats = stats || {};
  const safeChange = safeStats.changePercentage || {};

const data = [
  {
    Icon: IconChecked,
    label: 'Approved Applicants',
    value: safeStats.accepted ?? 0,
    change: (safeChange.accepted != null && safeChange.accepted !== 0)
      ? `${safeChange.accepted > 0 ? '+' : ''}${safeChange.accepted}%`
      : '',
  },
  // {
  //   Icon: IconRejected,
  //   label: 'Rejected Applicants',
  //   value: safeStats.rejected ?? 0,
  //   change: (safeChange.rejected != null && safeChange.rejected !== 0)
  //     ? `${safeChange.rejected > 0 ? '+' : ''}${safeChange.rejected}%`
  //     : '',
  // },
  {
    Icon: IconRejected,
    label: 'Rejected Applicants',
    value: safeStats.rejected ?? 0,
    change: (safeChange.rejected != null && safeChange.rejected !== 0)
      ? `${safeChange.rejected > 0 ? '+' : ''}${safeChange.rejected}%`
      : '',
  },

  {
    Icon: IconClock,
    label: 'Pending Applicants',
    value: safeStats.pending ?? 0,
    change: (safeChange.pending != null && safeChange.pending !== 0)
      ? `${safeChange.pending > 0 ? '+' : ''}${safeChange.pending}%`
      : '',
  },
  {
    Icon: IconWork,
    label: 'Total Job Applications',
    value: safeStats.total ?? 0,
    change: (safeChange.jobApplications != null && safeChange.jobApplications !== 0)
      ? `${safeChange.jobApplications > 0 ? '+' : ''}${safeChange.jobApplications}%`
      : '',
  },
];


  return (
    <div className={styles.statsGrid}>
      {data.map((stat, index) => (
        <StatCard key={index} {...stat} styles={styles} />
      ))}
    </div>
  );
}
