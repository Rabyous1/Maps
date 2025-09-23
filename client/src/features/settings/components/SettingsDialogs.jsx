'use client';

import GenericDialog from '@/components/ui/feedback/Dialog';
import SettingsDialogsContent from './SettingsDialogsContent';
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog';
import { useDeleteAccount } from '../hooks/settings.hooks';

export default function SettingsDialogs({ styles, openKey, onClose }) {
  const { mutate: deleteAccount } = useDeleteAccount();

  if (!openKey) return null;

  if (openKey === 'delete') {
    return (
      <DeleteConfirmationDialog
        open
        onClose={onClose}
        itemName="your account"
        onDelete={() => {
          deleteAccount();
          onClose();
        }}
      />
    );
  }

  const dialogTitleMap = {
    password: 'Change Password',
    qr: 'Scan QR Code',
  };

  return (
    <GenericDialog
      open
      onClose={onClose}
      title={dialogTitleMap[openKey]}
      styles={styles}
      PaperProps={{ className: styles.dialogPaper }}
      contentClassName={styles.dialogcontent}
    >
      <SettingsDialogsContent type={openKey} styles={styles} onCancel={onClose} />
    </GenericDialog>
  );
}
