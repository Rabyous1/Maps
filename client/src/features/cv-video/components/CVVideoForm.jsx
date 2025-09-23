'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { Formik, Form } from 'formik';
import VideoRecorder from '@/features/cv-video/components/VideoRecorder';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';
import VideoUpload from '@/features/cv-video/components/VideoUpload';
import VideoGuide from './VideoGuide';
import GenericCard from '@/components/ui/surfaces/Card';
import GenericButton from '@/components/ui/inputs/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import TaskIcon from '@mui/icons-material/Task';
import PublishIcon from '@mui/icons-material/Publish';
import { useSaveFile, useUploadCvVideo } from '@/features/files/hooks/files.hooks';
import { getFile } from '@/features/files/hooks/files.services';

export default function CVVideoForm({ styles }) {
    const { data: user } = useCurrentUser();
    const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const saveFileMutation = useSaveFile();
  const uploadCvVideoMutation = useUploadCvVideo(); 

  const [cameraActive, setCameraActive] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const { data: currentUser, isLoading, error } = useCurrentUser();

  const handleVideoReady = (file) => {
    setVideoFile(file);
  };    



const handleUseProfileVideo = async () => {
  try {
    if (!user?.cvVideoUrl) {
      alert("Aucune vidéo de profil trouvée.");
      return;
    }

    const filename = user.cvVideoUrl.split("/").pop();
    if (!filename) throw new Error("Nom de fichier invalide");

    const blob = await getFile({ filename }); 
    if (!(blob instanceof Blob)) throw new Error("Fichier non valide");

    const extension = filename.split('.').pop();
    const safeName = user.fullName?.replace(/\s+/g, '_').toLowerCase() || 'cv_video';

    const file = new File([blob], `cvvideo_${safeName}.${extension}`, {
      type: blob.type,
    });

    setVideoFile(file);
    alert("🎥 CV vidéo du profil chargé avec succès !");
  } catch (err) {
    console.error("❌ Erreur chargement vidéo profil :", err);
    alert("Erreur lors du chargement de la vidéo depuis le profil.");
  }
};



  const handleSubmit = async (values, actions) => {

  if (!videoFile) {
    console.warn('⚠️ Aucune vidéo fournie !');
    alert('Aucune vidéo fournie !');
    return;
  }

  if (!currentUser?.id) {
    console.warn('⚠️ Utilisateur non identifié !');
    alert('Utilisateur non identifié !');
    return;
  }

  try {
    if (applicationId) {
      console.log('📨 Envoi via PUT /applications/:id/cvvideo');
      await uploadCvVideoMutation.mutateAsync({
        applicationId,
        file: videoFile,
      });
      console.log('✅ Vidéo envoyée via PUT pour application ID:', applicationId);

      setVideoUrl(`Votre vidéo a été ajoutée à la candidature ID: ${applicationId}`);
    } else {
      console.log('📨 Envoi via POST /files');
      const formData = new FormData();
      formData.append('file', videoFile);

      const currentYear = new Date().getFullYear().toString();
      console.log('📁 Dossier année:', currentYear);

      const { url } = await saveFileMutation.mutateAsync({
        userId: currentUser.id,
        resource: 'video',
        folder: currentYear,
        filename: videoFile.name || 'video.webm',
        body: { formData },
      });

      console.log('✅ Vidéo uploadée à l’URL :', url);
      setVideoUrl(url);
    }
  } catch (err) {
    console.error('❌ Échec de l\'upload :', err);
  }

  actions.setSubmitting(false);
};


  if (isLoading) return <p>Chargement utilisateur…</p>;
  if (error) return <p style={{ color: 'red' }}>Erreur de chargement utilisateur.</p>;

  return (
    <GenericCard styles={styles}>
      <VideoGuide styles={styles} />

      <Formik initialValues={{}} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
  <div className={styles.recordUploadRow}>
    {!cameraActive ? (
      <GenericButton
        type="button"
        startIcon={<PlayArrowIcon />}
        onClick={() => setCameraActive(true)}
        className={styles.recordButton}
      >
        Record now
      </GenericButton>
    ) : (
      <VideoRecorder onVideoReady={handleVideoReady} styles={styles} />
    )}

    {!cameraActive && (
      <>
        <p className={styles.orText}>or</p>
        <VideoUpload onVideoReady={handleVideoReady} styles={styles} />



        {applicationId && (
          <>
            <p className={styles.orText}>or</p>
            <GenericButton
              type="button"
              variant="outlined"
              onClick={handleUseProfileVideo}
              className={styles.profileButton}
              startIcon={<VideoLibraryIcon />}
            >
              Use Profile CV Video
            </GenericButton>
          </>
          
        )}
        

      </>
    )}
  </div>


{videoFile && (
    <div className={styles.videoFilePreview}>
      <p className={styles.videoFileName}>
        <TaskIcon className={styles.videoFileNameIcon}/> Selected file: <strong>{videoFile.name}</strong>
      </p>
    </div>
  )}

            <div className={styles.actionButton}>
              <GenericButton
                type="submit"
                disabled={!videoFile || isSubmitting}
                variant="contained"
                fullWidth={false}
                startIcon={<PublishIcon />}
                className={styles.submitButton}
              >
                Submit Video CV
              </GenericButton>
            </div>


            {videoUrl && (
              <p>
                Vidéo enregistrée à :{' '}
                {applicationId ? (
                  <span>{videoUrl}</span>
                ) : (
                  <a href={videoUrl} target="_blank" rel="noreferrer">
                    {videoUrl}
                  </a>
                )}
              </p>
            )}
          </Form>
        )}
      </Formik>
    </GenericCard>
  );
}