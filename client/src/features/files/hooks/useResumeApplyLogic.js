// import { useRef, useState } from 'react';
// import { useGetMyFilesY } from './files.hooks';

// export const useResumeApplyLogic = ({ onConfirm, onClose }) => {
//   const [selectedResumeId, setSelectedResumeId] = useState(null);
//   const [showMore, setShowMore] = useState(false);
//   const [showVideoPrompt, setShowVideoPrompt] = useState(false);
//   const [uploadingFileName, setUploadingFileName] = useState(null);
//   const [localFile, setLocalFile] = useState(null);

//   const fileInputRef = useRef(null);
// const { data, isLoading, refetch } = useGetMyFilesY();


//   const resetDialogState = () => {
//     setSelectedResumeId(null);
//     setShowMore(false);
//     setUploadingFileName(null);
//     setLocalFile(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const handleUploadClick = () => fileInputRef.current?.click();

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploadingFileName(file.name);
//     setLocalFile(file);
//     setSelectedResumeId('temp');
//   };

//   const handleDownload = (resume) => {
//     if (!resume || !resume.fileName) return;
//     const iframe = document.createElement('iframe');
//     iframe.style.display = 'none';
//     iframe.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1/files/${resume.fileName}?download=true`;
//     document.body.appendChild(iframe);
//     setTimeout(() => {
//       document.body.removeChild(iframe);
//     }, 1000);
//   };

//   const handleApply = async () => {
//   if (!selectedResumeId && !localFile) {
//     console.warn('⚠️ Aucun fichier sélectionné !');
//     return;
//   }

//   try {
//     const formData = new FormData();

//     if (localFile && selectedResumeId === 'temp') {
//       formData.append('file', localFile);
//     }

//     if (selectedResumeId !== 'temp') {
//       const resumes = files.filter((file) => file.resource === 'resumes');
//       const selected = resumes.find((f) => f.id === selectedResumeId);
//       if (!selected) throw new Error('Fichier sélectionné introuvable.');

//       const fileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1/files/${selected.fileName}`;
//       const fetched = await fetch(fileUrl, { credentials: 'include' });
//       if (!fetched.ok) throw new Error(`Échec du téléchargement depuis ${fileUrl}`);
//       const blob = await fetched.blob();
//       const fileFromServer = new File([blob], selected.fileName, { type: blob.type });
//       formData.append('file', fileFromServer);
//     }

//     const opportunityId = '1730a23c-8ccf-4af7-9aec-598b9d0aff3e';
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1/applications/${opportunityId}/apply`,
//       {
//         method: 'POST',
//         credentials: 'include',
//         body: formData,
//       }
//     );

//     const text = await response.text();
//     const result = text ? JSON.parse(text) : {};
//     if (!response.ok) throw new Error(result.message || 'Erreur inconnue');

//     console.log('✅ Application envoyée avec succès :', result);

//     // 🔁 recharge les fichiers (inclus celui qu'on vient d'uploader)
//     await refetch();

//     onConfirm?.(result);
//     resetDialogState();
//     onClose?.();
//     setShowVideoPrompt(true);
//   } catch (err) {
//     console.error('❌ Erreur lors de l\'application :', err.message);
//   }
// };


//   const files = Array.isArray(data?.data) ? data.data : [];
//   const resumes = files.filter((file) => file.resource === 'resumes');

//   const tempUploadedResume = localFile
//     ? {
//         id: 'temp',
//         fileName: localFile.name,
//         fileDisplayName: localFile.name,
//         isTemp: true,
//       }
//     : null;

//   const displayedResumes = showMore
//     ? (tempUploadedResume ? [tempUploadedResume, ...resumes] : resumes)
//     : (tempUploadedResume ? [tempUploadedResume, ...resumes.slice(0, 1)] : resumes.slice(0, 2));

//   return {
//     selectedResumeId,
//     setSelectedResumeId,
//     showMore,
//     setShowMore,
//     showVideoPrompt,
//     setShowVideoPrompt,
//     uploadingFileName,
//     fileInputRef,
//     isLoading,
//     resumes,
//     displayedResumes,
//     handleUploadClick,
//     handleFileChange,
//     handleDownload,
//     handleApply,
//     handleClose: () => {
//       resetDialogState();
//       onClose?.();
//     },
//   };
// };
import { useRef, useState } from 'react';
import { useGetMyFiles } from '@/features/files/hooks/files.hooks';

export const useResumeApplyLogic = ({ onConfirm, onClose, opportunityId }) => {
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [showVideoPrompt, setShowVideoPrompt] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState(null);
  const [localFile, setLocalFile] = useState(null);
const [applicationId, setApplicationId] = useState(null);



  const fileInputRef = useRef(null);
  // destructure refetch
const { data, isLoading, refetch } = useGetMyFiles();


  const resetDialogState = () => {
    setSelectedResumeId(null);
    setShowMore(false);
    setUploadingFileName(null);
    setLocalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFileName(file.name);
    setLocalFile(file);
    setSelectedResumeId('temp');
  };

  const handleDownload = (resume) => {
    if (!resume || !resume.fileName) return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1/files/${resume.fileName}?download=true`;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const handleApply = async () => {
  if (!selectedResumeId && !localFile) {
    console.warn('⚠️ Aucun fichier sélectionné !');
    return;
  }

  try {
    const formData = new FormData();

    if (localFile && selectedResumeId === 'temp') {
      formData.append('file', localFile);
    }

    if (selectedResumeId !== 'temp') {
      const resumes = files.filter((file) => file.resource === 'resumes');
      const selected = resumes.find((f) => f.id === selectedResumeId);
      if (!selected) throw new Error('Fichier sélectionné introuvable.');

      const fileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1/files/${selected.fileName}`;
      const fetched = await fetch(fileUrl, { credentials: 'include' });
      if (!fetched.ok) throw new Error(`Échec du téléchargement depuis ${fileUrl}`);
      const blob = await fetched.blob();
      const fileFromServer = new File([blob], selected.fileName, { type: blob.type });
      formData.append('file', fileFromServer);
    }

    const response = await fetch(
     `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1/applications/${opportunityId}/apply`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    );

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(result.message || 'Erreur inconnue');

    console.log('✅ Application envoyée avec succès :', result);

    await refetch();

    // ✅ Récupération correcte du vrai ID de l’application créée
    const applicationId = result?.applicationId;
    if (!applicationId) {
      console.warn("Aucune applicationId disponible.");
    } else {
      setApplicationId(applicationId);
      console.log("📌 applicationId:", applicationId);
    }

    onConfirm?.(result);
    resetDialogState();
    onClose?.();
    setShowVideoPrompt(true);
  } catch (err) {
    console.error('❌ Erreur lors de l\'application :', err.message);
  }
};




  const files = Array.isArray(data?.data) ? data.data : [];
  const resumes = files.filter((file) => file.resource === 'resumes');

  const tempUploadedResume = localFile
    ? {
        id: 'temp',
        fileName: localFile.name,
        fileDisplayName: localFile.name,
        isTemp: true,
      }
    : null;

  const displayedResumes = showMore
    ? (tempUploadedResume ? [tempUploadedResume, ...resumes] : resumes)
    : (tempUploadedResume ? [tempUploadedResume, ...resumes.slice(0, 1)] : resumes.slice(0, 2));

  return {
    applicationId,
    setApplicationId,
    setLocalFile, 
  setUploadingFileName, 
    selectedResumeId,
    setSelectedResumeId,
    showMore,
    setShowMore,
    showVideoPrompt,
    setShowVideoPrompt,
    uploadingFileName,
    fileInputRef,
    isLoading,
    resumes,
    displayedResumes,
    handleUploadClick,
    handleFileChange,
    handleDownload,
    handleApply,
    handleClose: () => {
      resetDialogState();
      onClose?.();
    },
  };
};