"use client";

import React, { useState } from "react";


import GenericCard from "@/components/ui/surfaces/Card";
import DeleteConfirmationDialog from "@/components/dialogs/DeleteConfirmationDialog";
import FileRow from "./FileRow";
import GenericButton from "@/components/ui/inputs/Button";
import UploadIcon from "@/assets/icons/actions/upload-icon.svg";
import NotFoundImage from "@/assets/images/png/not-found.png";
import { useAppRouter } from "@/helpers/redirections";
import { useDeleteFile, useMyFiles } from "../../hooks/files.hooks";
import Image from "next/image";


export default function MyResumes({ styles }) {
  const { data, isLoading, isError, refetch } = useMyFiles({}, { keepPreviousData: true });
  const deleteFileMutation = useDeleteFile();
  const [fileToDelete, setFileToDelete] = useState(null);
  const files = data?.data ?? [];
  const { pushResume } = useAppRouter();

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
  };

  const handleConfirmDelete = () => {
    if (!fileToDelete) return;
    const filename = fileToDelete.filePath?.split("/").pop();
    if (!filename) return;

    deleteFileMutation.mutate(
      { filename },
      {
        onSuccess: () => {
          setFileToDelete(null);
        },
      }
    );
  };

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        Error loading files.
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <GenericCard styles={styles} className={styles.fileRowsContainer}>
        <div className={styles.titleContainer}>
          <p className={styles.myResumesTitle}>
            My Resumes
            <span className={styles.myResumesTotal}> ({data.total} total)</span>
          </p>
          <GenericButton type="button"
            startIcon={<UploadIcon className={styles.uploadIcon} />}
            className={styles.uploadResumeButton}
            onClick={pushResume}
            variant="outlined">Upload Video Resume</GenericButton>

        </div>

        {files.length === 0 ? (
          <div className={styles.noFilesContainer}>
            <Image
              src={NotFoundImage}
              alt="No resumes found"
              className={styles.notFoundImage}
              priority
            />

            <p className={styles.noFilesText}>You have no resume yet.</p>
          </div>
        ) : (
          files.map((file) => (
            <FileRow key={file.id} file={file} styles={styles} onDelete={handleDeleteClick} />
          ))
        )}
      </GenericCard>

      <DeleteConfirmationDialog
        open={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(null)}
        itemName={fileToDelete?.fileDisplayName}
        onDelete={handleConfirmDelete}
      />
    </>
  );
}
