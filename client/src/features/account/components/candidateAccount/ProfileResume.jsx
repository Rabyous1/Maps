"use client";
import React from "react";
import { useGetFile } from "@/features/files/hooks/files.hooks";
import FileIcon from "@/assets/icons/account/icon-file.svg";
import { Tooltip } from "@mui/material";

export default function ProfileResume({ cvUrl, displayName, styles }) {
  const filename = cvUrl?.split("/").pop();
  const { data: fileUrl } = useGetFile(filename);

  const handleOpenFile = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const isFileAvailable = !!cvUrl && !!fileUrl;

  return (
    <Tooltip title="Click here to preview your resume.">

      <div
        className={`${styles.cvItem} ${!isFileAvailable ? styles.disabled : ""}`}
        onClick={isFileAvailable ? handleOpenFile : undefined}
      >
        <FileIcon className={styles.resumeIcon} aria-label="View resume" />
        <p className={styles.cvPath}>{displayName}</p>
      </div>
    </Tooltip>

  );
}
