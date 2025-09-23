'use client';

import React from 'react';
import FileUploader from '@/components/files/FileUploader';
import { useSaveFile } from '@/features/files/files.hooks';

const VideoUploader = ({ field, form, currentUser, styles, onVideoSelected }) => {
  const saveFileMutation = useSaveFile();

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const currentYear = new Date().getFullYear().toString();

      const formData = new FormData();
formData.append("file", file);
formData.append("userId", currentUser?.id);
formData.append("resource", "video");
formData.append("folder", currentYear);
formData.append("filename", file.name);

const { url } = await saveFileMutation.mutateAsync(formData);


      if (form && field?.name) {
        form.setFieldValue(field.name, url);
      }

      if (onVideoSelected) {
        onVideoSelected(file); // 🟢 met à jour le state du parent
      }
    } catch (e) {
      console.error("Erreur lors de l’upload vidéo :", e);
    }
  };

  if (!field || !form) return null;

  return (
    <FileUploader
      onUpload={handleFileUpload}
      accept="video/mp4,video/webm"
      className={styles?.fileUploader}
    >
      <button
        type="button"
        className={styles?.uploadVideoButton || ''}
      >
        {field.value ? "Remplacer la vidéo" : "Uploader une vidéo"}
      </button>
    </FileUploader>
  );
};


export default VideoUploader;
