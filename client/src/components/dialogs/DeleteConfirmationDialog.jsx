import React from 'react';
import styles from '@/assets/styles/ui/dialogs/DeleteConfirmationDialog.module.scss';
import GenericDialog from '../ui/feedback/Dialog';

const DeleteConfirmationDialog = ({
  open,
  onClose,
  itemName,
  onDelete
}) => {
  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Delete Confirmation"
      PaperProps={{ className: styles.dialogPaper }}
      styles={styles}
      actions={
        <>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onDelete}>
            Delete
          </button>
        </>
      }
    >
      <div className={styles.warningBox}>
        Are you sure you want to delete {itemName}?
      </div>
    </GenericDialog>
  );
};

export default DeleteConfirmationDialog;
