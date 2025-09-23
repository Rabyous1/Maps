import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@/assets/icons/actions/close-icon.svg";

const GenericDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  actionsClassName,
  contentClassName,
  PaperProps,
  showCloseIcon = true,
  styles,
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={PaperProps}>
      <DialogTitle className={styles?.dialogHeader} style={{ position: 'relative' }}>
        <span className={styles?.titleText}>
          {title}
        </span>

        {showCloseIcon && (
          <IconButton
            onClick={onClose}
            aria-label="close"
            className={styles?.closeIconButton}
          >
            <CloseIcon className={styles?.closeIcon} />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent className={contentClassName}>{children}</DialogContent>

      {actions && (
        <DialogActions className={actionsClassName}>{actions}</DialogActions>
      )}
    </Dialog>
  );
};

export default GenericDialog;
