
'use client';

import React, { useEffect, useRef } from "react";
import GenericDialog from "@/components/ui/feedback/Dialog";
import { useCurrentUser } from "@/features/user/hooks/users.hooks";
import { useVideoCall } from "./VideoCallContext";
import * as Yup from "yup";
import { applicationStatisAfterMeetOptions } from "@/utils/constants";
import GenericFormikForm from "@/components/form/GenericFormikForm";
import { useUpdateApplicationStatus } from "@/features/applications/hooks/applications.hooks";

export default function EndCallDialog({ styles, targetUser, applicationId, onStatusUpdated }) {
  const { callStatus, showPostCallDialog, setShowPostCallDialog } = useVideoCall();
  const { data: currentUser } = useCurrentUser();
  const prevCallStatusRef = useRef(callStatus);
  const isRecruiter = currentUser?.roles?.includes("Recruteur");

  const updateApplicationStatusMutation = useUpdateApplicationStatus();

  useEffect(() => {
    if (
      prevCallStatusRef.current === "in-progress" &&
      callStatus === "idle" &&
      isRecruiter
    ) {
      setShowPostCallDialog(true);
      console.log("[DIALOG] Candidate info to evaluate:", targetUser);
    }
    prevCallStatusRef.current = callStatus;
  }, [callStatus, isRecruiter, setShowPostCallDialog, targetUser]);

  const initialValues = {
    status: "",
  };

  const validationSchema = Yup.object().shape({
    status: Yup.string().required("Status is required"),
  });

  const handleSubmit = (values) => {
    updateApplicationStatusMutation.mutate(
      { applicationId, status: values.status },
      {
        onSuccess: () => {
          setShowPostCallDialog(false);
          if (onStatusUpdated) {
          onStatusUpdated(); 
        }
        }
      }
    );
  };

  return (
    <GenericDialog
      open={showPostCallDialog}
      onClose={() => setShowPostCallDialog(false)}
      title="Candidate Evaluation"
      styles={{
        dialogPaper: styles.dialogPaper,
        closeIcon: styles.closeIcon,
        closeIconButton: styles.closeIconButton,
        dialogHeader: styles.dialogHeader,
        titleText: styles.titleText,
      }}
      PaperProps={{ className: styles.dialogPaper }}
      contentClassName={styles.dialogContentWrapper}
    >
      <div className={styles.wrapperDialog}>
        <span className={styles.userInfoLabel}>Fullname : </span>
        <span className={styles.userInfoValue}>{targetUser?.fullName}</span>
      </div>
      <div className={styles.userInfoRow}>
        <span className={styles.userInfoLabel}>Email: </span>
        <span className={styles.userInfoValue}>{targetUser?.email}</span>
      </div>
      {targetUser?.phone && (
        <div className={styles.userInfoRow}>
          <span className={styles.userInfoLabel}>Phone Number:</span>
          <span className={styles.userInfoValue}>{targetUser.phone}</span>
        </div>
      )}
      <GenericFormikForm
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        styles={styles}
        fields={[
          {
            name: "status",
            label: "Update Application Status :",
            type: "select",
            required: true,
            options: applicationStatisAfterMeetOptions,
            placeholder: "Select Status",
            fullWidth: true,
          },
        ]}
        submitText="Submit"
        cancelText="Cancel"
        onCancel={() => setShowPostCallDialog(false)}
        submitFullWidth
        cancelFullWidth
        formClassName={styles.formDialog}
      />
    </GenericDialog>
  );
}
