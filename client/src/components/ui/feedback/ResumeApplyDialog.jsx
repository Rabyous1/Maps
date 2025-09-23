'use client';

import UploadIcon from '@/assets/icons/dialog/Upload.svg';
import DownloadIcon from '@/assets/icons/dialog/Download.svg';
import { Radio } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GenericDialog from './Dialog';
import styles from '../../../assets/styles/ui/dialogs/ResumeApplyDialog.module.scss';
import { useResumeApplyLogic } from '@/features/files/hooks/useResumeApplyLogic';

export default function ResumeApplyDialog({ open, onClose, onConfirm, opportunityId }) {
  const {
    applicationId,
     setLocalFile, 
  setUploadingFileName, 
    selectedResumeId,
    setSelectedResumeId,
    showMore,
    setShowMore,
    showVideoPrompt,
    setShowVideoPrompt,
    fileInputRef,
    isLoading,
    displayedResumes,
    resumes,
    handleUploadClick,
    handleFileChange,
    handleDownload,
    handleApply,
    handleClose,
  } = useResumeApplyLogic({ onConfirm, onClose, opportunityId });

  return (
    <>
      <GenericDialog
        open={open}
        onClose={handleClose}
        styles={styles}
        PaperProps={{ className: styles.dialogPaper }}
        actionsClassName={styles.dialogActions}
        contentClassName={styles.dialogContent}
        title={
          <div className={styles.headerSticky}>
            <div className={styles.headerContainer}>
              <h2 className={styles.dialogTitle}>Apply Candidate</h2>
            </div>
            <img src="/jobResume.svg" alt="illustration" className={styles.dialogImage} />
          </div>
        }
        actions={
          <>
            <button className={styles.cancelButton} onClick={handleClose}>Cancel</button>
            <button
              className={styles.applyButton}
              onClick={handleApply}
              disabled={!selectedResumeId}
            >
              Apply
            </button>
          </>
        }
      >
        <div className={styles.innerContainer} onClick={(e) => e.stopPropagation()}>
          <button className={styles.uploadNew} onClick={handleUploadClick}>
            <UploadIcon className={styles.uploadIcon} />
            Upload New
          </button>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />

          {isLoading ? (
            <p>Loading resumes...</p>
          ) : (
            <div
              className={`${styles.resumeList} ${!showMore ? styles.resumeListLimited : ''}`}
            >
              {displayedResumes.map((resume) => (
                <div
                  key={resume.id}
                  className={styles.resumeItem}
                  onClick={() => {
                    setSelectedResumeId(resume.id);
                    if (!resume.isTemp) {
                      setLocalFile(null);
                      setUploadingFileName(null);
                    }
                  }}
                >
                  <span>{resume.fileDisplayName || resume.fileName}</span>

                  <div className={styles.actions}>
                    {resume.id !== 'temp' && (
  <DownloadIcon
    onClick={(e) => {
      e.stopPropagation();
      handleDownload(resume);
    }}
    className={styles.downloadIcon}
    title="Download"
  />
)}

                    <Radio
                      checked={selectedResumeId === resume.id}
                      onChange={() => setSelectedResumeId(resume.id)}
                      value={resume.id}
                      size="small"
                      style={{ marginLeft: 'auto' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {resumes.length > 2 && (
            <button
              className={styles.showMoreBtn}
              onClick={() => setShowMore((prev) => !prev)}
            >
              {showMore ? 'Show Less Resumes' : 'Show More Resumes'}
              <KeyboardArrowDownIcon
                className={`${styles.chevron} ${showMore ? styles.rotated : ''}`}
              />
            </button>
          )}
        </div>
      </GenericDialog>

      <GenericDialog
        open={showVideoPrompt}
        onClose={() => setShowVideoPrompt(false)}
        styles={styles}
        PaperProps={{ className: styles.dialogPaper }}
        actionsClassName={styles.dialogActions}
        contentClassName={styles.dialogContent}
        title=""
        actions={
          <>
            <button
              className={styles.cancelButton}
              onClick={() => setShowVideoPrompt(false)}
            >
              Non
            </button>
            <button
  className={styles.applyButton}
  onClick={() => {
    if (applicationId) {
      window.location.href = `/cv-video?applicationId=${applicationId}`;
    } else {
      console.warn("Aucune applicationId disponible.");
    }
  }}
>
  Oui
</button>

          </>
        }
      >
        <h2 className={styles.dialogTitle}>
          Would you also like to add a video CV ?
        </h2>
      </GenericDialog>
    </>
  );
}