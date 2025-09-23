import React, { useState, useRef } from "react";
import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSaveFile, useDeleteFile } from "@/features/files/hooks/files.hooks";
import { useQueryClient } from "react-query";
import { useCurrentUser } from "@/features/user/hooks/users.hooks";
import styles from "@/assets/styles/components/ResumeFileUploader.module.scss";

const ResumeFileUploader = ({ onResumeDeleted, onResumeUpdated }) => {
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading, error } = useCurrentUser();

  const cvUrl = currentUser?.cvUrl;
  const filename = cvUrl ? cvUrl.split("/").pop() : null;

  const inputRef = useRef(null);

  const saveFileMutation = useSaveFile();
  const deleteFileMutation = useDeleteFile();

  const handleFileUpload = async (file) => {
    if (!currentUser?.id) {
      console.error("No current user found");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const currentYear = new Date().getFullYear().toString();

      await saveFileMutation.mutateAsync({
        userId: currentUser.id,
        resource: "resumes",
        folder: currentYear,
        filename: file.name,
        body: { formData },
      });

      queryClient.invalidateQueries(["files", file.name]);
      queryClient.invalidateQueries(["currentUser"]);

      onResumeUpdated?.(file.name);
    } catch (e) {
      console.error(e);
    }
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      e.target.value = ""; 
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading user</p>;

  return (
    <>
          <div className={styles.resumeInfo}>
        {filename ? (
          <>
           <Button
  variant="outlined"
  fullWidth
  startIcon={<DeleteIcon />}
  className={styles.removeResumeBtn}
  onClick={() => {
    if (!filename) return;
    deleteFileMutation.mutate(
      { filename },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["currentUser"]);
          onResumeDeleted?.();
        },
        onError: (error) => {
          console.error("Delete failed:", error);
        },
      }
    );
  }}
>
  Remove Current Resume
</Button>
          </>
        ) : (
          <p className={styles.noResumeText}>No resume uploaded yet.</p>
        )}
      </div>
      {/* Hidden file input */}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={onInputChange}
      />

      {/* MUI Button with upload icon triggers hidden input */}
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        className={styles.fileUploaderButton}
        onClick={() => inputRef.current?.click()}
      >
        Upload New Resume
      </Button>
    </>
  );
};

export default ResumeFileUploader;
