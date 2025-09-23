'use client';

import { useMemo } from 'react';
import styles from "@/assets/styles/layout/UnauthorizedPage.module.scss";
import PleaseLoginPage from './PleaseLoginPage';
import UnauthorizedPage from './UnauthorizedPage';


export default function ProtectedRoute({ isProtected, isUnauthorized, user, children }) {

  const checkLoading = useMemo(() => {
    if (isProtected && user === undefined) {
      return true;
    }
    return false;
  }, [isProtected, user]);

  if (checkLoading) {
    return (
      <PleaseLoginPage styles={styles}/>
    ) 
    
  }

  if (isUnauthorized) {
    return (
      <UnauthorizedPage styles={styles}/>
    );
  }

  return children;
}
