'use client';

import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';
import { useAuthorization } from '@/helpers/authHelpers';
import Spinner from '@/components/ui/feedback/Spinner';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import TranslationsProvider from '@/components/translation/TranslationProvider';

export default function ProtectedLayoutWrapper({ locale, namespaces = ['auth'], children }) {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const { isProtected, isUnauthorized } = useAuthorization(pathname, user);

  if (isLoading) return <Spinner />;

  return (
    <TranslationsProvider locale={locale} namespaces={namespaces}>
      <ProtectedRoute isProtected={isProtected} isUnauthorized={isUnauthorized} user={user}>
        {children(user)}
      </ProtectedRoute>
    </TranslationsProvider>
  );
}
