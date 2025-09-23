'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';
import { frontUrls } from "@/utils/front-urls";
import { useTwoFA } from '@/context/TwoFAContext';

export const useRoleRedirect = () => {
  const { replace, pushLogin, pushUsers, pushDashboard, pushHome, pushChooseRole, pushCompleteInfo } = useAppRouter();
  const { data: user, isLoading } = useCurrentUser();
  const { is2FAPending } = useTwoFA();

  useEffect(() => {
    console.log('🛣️ useRoleRedirect effect fired', { user, isLoading, is2FAPending });

    if (is2FAPending) {
      console.log("🔐 2FA pending, skipping redirection");
      return;
    }

    if (isLoading) {
      console.log('⏳ Still loading user...');
      return;
    }

    if (!user) {
      console.log('🚪 No user, would redirect to login');
      // pushLogin();
      return;
    }

    if (user.isFirstTimeLoggedIn) {
      console.log('🎉 First time login, redirect to choose role');
      pushChooseRole();
      return;
    }

    if (user.isCompleted) {
      console.log('✅ Profile completed, redirect to dashboard');
      pushDashboard();
      return;
    }

    if (user.roles?.includes('Admin')) {
      console.log('👑 Admin detected, redirect to users page');
      pushUsers();
      return;
    }

    if (user.roles?.includes('Recruteur') || user.roles?.includes('Candidat')) {
      console.log('📝 Recruiter/Candidate, redirect to complete info');
      pushCompleteInfo();
      return;
    }

    console.log('🏠 Default redirect to home');
    pushHome();
  }, [user, isLoading, is2FAPending]);
};

export const useBackFromOpportunityDetails = () => {
  const { push } = useAppRouter();
  const { data: user } = useCurrentUser();

  return useCallback(() => {
    const lastVisited = typeof window !== "undefined"
      ? sessionStorage.getItem("lastVisitedPage")
      : null;

    if (user?.roles?.includes("Recruteur")) {
      if (lastVisited === frontUrls.applications) {
        push(frontUrls.applications);
      } else {
        push(frontUrls.opportunities);
      }
    } else if (user?.roles?.includes("Candidat")) {
      push(frontUrls.myApplications);
    } else {
      push(frontUrls.dashboard);
    }
  }, [user, push]);
};

export const useAppRouter = () => {
  const router = useRouter();

  return {
    pushLogin: () => router.push(frontUrls.login),
    pushDashboard: () => router.push(frontUrls.dashboard),
    pushUsers: () => router.push(frontUrls.users),
    pushChooseRole: () => router.push(frontUrls.chooseRole),
    pushHome: () => router.push(frontUrls.dashboard),
    pushOpportunities: () => router.push(frontUrls.opportunities),
    pushOpportunityDetails: (id) => router.push(`${frontUrls.opportunities}/${id}`),
    pushOpportunityDetailsEdit: (id) => router.push(`${frontUrls.opportunities}/${id}/edit`),
    pushCandidatesList:  (id) => router.push(`${frontUrls.applications}/${id}/candidates`),
    pushApplicantions:  () => router.push(`${frontUrls.applications}`),
    pushChat: () => router.push(`${frontUrls.chat}`),
    pushVideoChat: (id) => router.push(`${frontUrls.videochat}/${id}`),
    pushResume: () => router.push(`${frontUrls.resume}`),
    pushCompleteInfo: () => router.push('/complete'),
    pushNotifications: () => router.push(`${frontUrls.notifications}`),
    pushGlobe3D: () => router.push(`${frontUrls.globe3D}`),
    replace: router.replace,
    push: router.push,
    back: router.back,
  };
};