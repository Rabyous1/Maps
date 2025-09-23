'use client';

import { useState } from 'react';
import { useQueryClient } from 'react-query';
import SettingsCard from '@/features/settings/components/SettingsCard';
import SettingsDialogs from '@/features/settings/components/SettingsDialogs';
import { settingsCards } from './SettingsContent';
import { useDisableTwoFactor } from '@/features/auth/hooks/auth.hooks';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';

export default function Settings({ styles }) {
  const [openDialogKey, setOpenDialogKey] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useCurrentUser();
  const twoFactorEnabled = currentUser?.twoFactorEnabled;

  const disable2FA = useDisableTwoFactor();

  const handleCloseDialog = () => setOpenDialogKey(null);

  const handlers = {
    handleChangePassword: () => setOpenDialogKey('password'),
    handleActivateQr: () => setOpenDialogKey('qr'),
    handleDisable2FA: () => {
      if (!disable2FA.isLoading) {
        disable2FA.mutate(null, {
          onSuccess: () => {
            queryClient.invalidateQueries(['currentUser']); // 🔁 re-fetch user
          },
        });
      }
    },
    handleDeleteAccount: () => setOpenDialogKey('delete'),
  };

  const cards = settingsCards(styles, handlers, twoFactorEnabled);

  return (
    <>
      <div className={styles.container}>
        {cards.map((card) => (
          <SettingsCard key={card.key} {...card} styles={styles} />
        ))}
      </div>
      <SettingsDialogs
        openKey={openDialogKey}
        onClose={handleCloseDialog}
        styles={styles}
      />
    </>
  );
}
