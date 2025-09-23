import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import styles from "@/assets/styles/features/account/AddDialogsSections.module.scss";

export function AddNewSection({ text, onBack }) {
  return (
    <div className={styles.emptyStateContainer}>
      <IconButton onClick={onBack} aria-label="Back" size="large">
        <ArrowBackIcon fontSize="large" />
      </IconButton>
      <p className={styles.emptyStateText}>{text}</p>
    </div>
  );
}
