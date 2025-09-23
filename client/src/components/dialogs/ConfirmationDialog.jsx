import React from 'react';
import styles from '@/assets/styles/ui/dialogs/ConfirmationDialog.module.scss';
import GenericDialog from '../ui/feedback/Dialog';

const RecoverConfirmationDialog = ({
  open,
  onClose,
  itemName,
  onRecover
}) => {
  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Recover Confirmation"
      PaperProps={{ className: styles.dialogPaper }}
      styles={styles}
      actions={
        <>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.recoverButton} onClick={onRecover}>
            Recover
          </button>
        </>
      }
    >
      <div className={styles.warningBox}>
        Are you sure you want to recover {itemName}?
      </div>
    </GenericDialog>
  );
};

export default RecoverConfirmationDialog;
