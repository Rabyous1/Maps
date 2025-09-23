'use client';

import React from 'react';
import AccountForm from './candidateAccount/AccountForm';
import RecruiterAccount from './recruiterAccount/RecruiterAccount';
import Spinner from '@/components/ui/feedback/Spinner';
// import { useAccount } from '../hooks/account.hooks';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';

export default function RoleBasedAccount({ styles }) {
  const { data: user, isLoading, isError } = useCurrentUser();
console.log("user", user);
  if (isLoading) return <Spinner />;
  if (isError || !user) {
    return (
      <div className={styles.noAccess}>
        Unable to load your account. Please try again.
      </div>
    );
  }
  if (user.roles.includes('Recruteur')) {
    return <RecruiterAccount user={user} styles={styles} />;
  }

  if (user.roles.includes('Candidat')) {
    return <AccountForm styles={styles} />;
  }

  return (
    <div className={styles.noAccess}>
      You don’t have access to this page.
    </div>
  );
}
