'use client';
import styles from "@/assets/styles/features/account/stepper.module.scss";
import dynamic from 'next/dynamic';
import React from 'react';

const AccountStepperPage = dynamic(() => import('@/features/account/components/stepper/AccountStepperPage.jsx'), { ssr: false });



const AccountPage = () => {
  return <AccountStepperPage styles={styles} />;
};

export default AccountPage;
