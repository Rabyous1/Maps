"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";

import FileIcon from "@/assets/icons/account/icon-file.svg";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import DeleteIcon from "@/assets/icons/actions/delete-icon.svg";
import ViewIcon from "@/assets/icons/auth/icon-eyeon.svg";
import { useGetFile } from "../../hooks/files.hooks";


export default function FileRow({ file, styles, onDelete }) {
  const filename = file.filePath?.split("/").pop();
  const { data: fileUrl } = useGetFile(filename);

  const handleViewClick = () => {
    if (fileUrl) window.open(fileUrl, "_blank");
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${filename}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.fileDisplayName || filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className={styles.fileRow} key={file.id}>
      <div className={styles.fileInfo}>
        <FileIcon className={styles.fileIcon} />
        <span className={styles.fileName}>{file.fileDisplayName}</span>
      </div>
      <span className={styles.fileDate}>
        Last updated : {new Date(file.updatedAt).toLocaleDateString()}
      </span>
      <div className={styles.actions}>
        <Tooltip title="View file">
          <IconButton onClick={handleViewClick} size="small">
            <ViewIcon className={styles.viewIcon} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download file">
          <IconButton onClick={handleDownload} size="small">
            <SaveAltIcon className={styles.saveIcon} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete file">
          <IconButton onClick={() => onDelete(file)} size="small">
            <DeleteIcon className={styles.deleteIcon} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
