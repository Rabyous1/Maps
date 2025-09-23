'use client'

import React from 'react';
import CandidateDashboard  from './CandidateDashboard';
import RecruiterDashboard  from './RecruiterDashboard';
import { useCurrentUser } from '../user/hooks/users.hooks';
import styles from "@/assets/styles/features/dashboard/Dashboard.module.scss"

export default function RoleBasedDashboard() {
  const { data: user} = useCurrentUser();

  const isRecruiter = user.roles.includes('Recruteur');
  const isCandidate = user.roles.includes('Candidat');

  if (isRecruiter) {
    return <RecruiterDashboard styles={styles}/>;
  }
  if (isCandidate) {
    return <CandidateDashboard styles={styles}/>;
  }

  return <p>You don’t have access to this dashboard.</p>;
}
