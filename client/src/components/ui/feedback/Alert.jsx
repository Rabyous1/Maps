import React from "react";
import { Alert, Snackbar } from "@mui/material";
import { useAlert } from "@/context/AlertContext";

const GenericAlert = () => {
  const {
    alertOpen,
    alertMessage,
    alertSeverity,
    closeAlert,
    alertOptions = {},
  } = useAlert();

  const {
    autoHideDuration = 6000, 
    position = { vertical: "top", horizontal: "center" }, 
    variant = "standard", 
    icon = true, 
    action = null, 
  } = alertOptions;

  return (
    <Snackbar
      open={alertOpen}
      autoHideDuration={autoHideDuration}
      onClose={closeAlert}
      anchorOrigin={position}
    >
      <Alert
        onClose={closeAlert}
        severity={alertSeverity}
        variant={variant}
        icon={icon ? undefined : false}
        action={action}
      >
        {alertMessage}
      </Alert>
    </Snackbar>
  );
};

export default GenericAlert;
