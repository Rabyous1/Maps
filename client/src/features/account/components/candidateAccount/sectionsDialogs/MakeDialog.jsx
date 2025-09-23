import React from "react";
import styles from "@/assets/styles/features/account/AddDialogsSections.module.scss";
import { useUpdateAccount } from "@/features/account/hooks/account.hooks";
import GenericDialog from "@/components/ui/feedback/Dialog";

export function MakeDialog(title, Content) {
  return function DialogComponent({ open, onClose, ...rest }) {
    const update = useUpdateAccount();

    const handleSave = (values) => {
      update.mutate({ values });
    };

    return (
      <GenericDialog
        open={open}
        onClose={onClose}
        title={title}
        styles={styles}
        PaperProps={{ className: styles.dialogPaper }}
        contentClassName={styles.dialogcontent}
      >
        <Content
          {...rest}
          styles={styles}
          onSave={handleSave}
          onClose={onClose}
        />
      </GenericDialog>
    );
  };
}
