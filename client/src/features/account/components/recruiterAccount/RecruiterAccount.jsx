// "use client";
// import React, { useState, useRef, useEffect } from 'react';
// import styles from '@/assets/styles/features/account/Account.module.scss';
// import { basicInfosSections, profileSections } from './ProfileSections';
// import AccountCard from '../candidateAccount/AccountCard';
// import ProfileImage from '../candidateAccount/ProfileImage';
// import EditSectionDialog from './EditSectionDialog';

// export default function RecruiterAccount({ user }) {
//   const [expandedFields, setExpandedFields] = useState({});
//   const [editingSection, setEditingSection] = useState(null); 

//   const toggleExpand = (fieldKey) => {
//     setExpandedFields((prev) => ({
//       ...prev,
//       [fieldKey]: !prev[fieldKey],
//     }));
//   };

//   const ExpandableText = ({ fieldKey, value, isRecruiter = false }) => {
//     const textRef = useRef(null);
//     const [hasOverflow, setHasOverflow] = useState(false);
//     const isExpanded = expandedFields[fieldKey];

//     useEffect(() => {
//       const element = textRef.current;
//       if (!element) return;

//       const checkOverflow = () => {
//         const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
//         const maxAllowedHeight = lineHeight * 2; // Exactly 2 lines
//         const currentHeight = element.scrollHeight;

//         setHasOverflow(currentHeight > maxAllowedHeight + 1);
//       };

//       checkOverflow();
//       const resizeObserver = new ResizeObserver(checkOverflow);
//       resizeObserver.observe(element);

//       return () => resizeObserver.disconnect();
//     }, [value]);

//     return (
//       <div className={styles.expandableTextContainer}>
//         <p
//           ref={textRef}
//           className={`${isRecruiter ? styles.summaryTextRecruiter : styles.summaryText} ${
//             !isExpanded && hasOverflow ? styles.truncated : ''
//           }`}
//           style={{ 
//             maxHeight: !isExpanded && hasOverflow 
//               ? '3em'
//               : 'none' 
//           }}
//           dangerouslySetInnerHTML={{ __html: value }}
//         />
//         {hasOverflow && (
//           <button
//             className={styles.seeMoreButton}
//             onClick={() => toggleExpand(fieldKey)}
//             aria-expanded={isExpanded}
//             type="button"
//           >
//             {isExpanded ? 'See Less' : 'See More'}
//           </button>
//         )}
//       </div>
//     );
//   };

//   const renderFields = (fields = [], sectionKey = '') => {
//     return (
//       <div className={`${styles.fieldsWrapper} ${styles[sectionKey] || ''}`}>
//         {fields.map((field) => {
//           if (field.key === 'profilePicture') {
//             return (
//               <div key={field.key} className={`${styles.field} ${styles[field.className] || ''}`}>
//                 <ProfileImage
//                   imageUrl={user?.[field.key] !== '—' ? user?.[field.key] : null}
//                   styles={styles}
//                   currentUser={user}
//                 />
//               </div>
//             );
//           }

//           const isRecruiterSummarySection = sectionKey === 'recruiterSummary';
//           const shouldShowFieldRow = !['namePicSection', 'recruiterSummary'].includes(sectionKey);

//           return (
//             <div
//               key={field.key}
//               className={[
//                 styles.field,
//                 styles[field.className] || '',
//                 shouldShowFieldRow ? styles.fieldRow : '',
//               ].filter(Boolean).join(' ')}
//             >
//               {field.icon && <field.icon className={styles.icon} />}
//               <span className={styles.label}>{field.label || ''}</span>
//               <span className={isRecruiterSummarySection ? styles.recruiterValue : (styles[field.className] || styles.value)}>
//                 {(field.key === 'summary' || field.key === 'recruiterSummary') && user?.[field.key] !== '—'
//                   ? <ExpandableText 
//                       fieldKey={field.key} 
//                       value={user[field.key]} 
//                       isRecruiter={isRecruiterSummarySection} 
//                     />
//                   : user?.[field.key] ?? '—'}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   const handleEditOpen = (section) => {
//     setEditingSection(section);
//   };

//   const handleDialogClose = () => {
//     setEditingSection(null);
//   };

//   const handleDialogSave = (sectionKey, updatedValues) => {
//     console.log(`Save section ${sectionKey}:`, updatedValues);
//     setEditingSection(null);
//   };

//   const renderSection = (section) => {
//     const cardClass = [
//       styles.card,
//       section.key === 'namePicSection' ? styles.namePicSectionCard : '',
//       styles[section.cardClass] || '',
//       styles[section.key] || ''
//     ].filter(Boolean).join(' ');

//     return (
//       <AccountCard
//         key={section.key}
//         title={section.title || ''}
//         styles={styles}
//         onEdit={() => handleEditOpen(section)} // <-- changed from console.log to open dialog
//         className={cardClass}
//       >
//         {renderFields(section.fields, section.key)}
//       </AccountCard>
//     );
//   };

//   return (
//     <div className={styles.profileWrapper}>
//       <div className={styles.left}>
//         {basicInfosSections.map(renderSection)}
//       </div>
//       <div className={styles.right}>
//         {profileSections.map(renderSection)}
//       </div>

//       {/* Edit dialog (minimal integration) */}
//       {editingSection && (
//         <EditSectionDialog
//           open={Boolean(editingSection)}
//           section={editingSection}
//           user={user}
//           onClose={handleDialogClose}
//           onSave={handleDialogSave}
//           styles={styles}
//         />
//       )}
//     </div>
//   );
// }
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { basicInfosSections, profileSections } from './ProfileSections';
import AccountCard from '../candidateAccount/AccountCard';
import ProfileImage from '../candidateAccount/ProfileImage';
import EditSectionDialog from './EditSectionDialog';
import EyeIcon from "@/assets/icons/auth/icon-eyeon.svg";
import GenericTextField from '@/components/ui/inputs/Textfield';
import GenericButton from '@/components/ui/inputs/Button';
import GenericDialog from '@/components/ui/feedback/Dialog';
import { IconButton } from '@mui/material';
import { useRevealFiscal, useUpdateAccount } from '../../hooks/account.hooks';

export default function RecruiterAccount({ user, styles }) {
  const [expandedFields, setExpandedFields] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [revealedFields, setRevealedFields] = useState({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [fieldToReveal, setFieldToReveal] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const { mutate: revealFiscal, isLoading } = useRevealFiscal();
  const { mutate: updateAccount, isLoading: isUpdating } = useUpdateAccount();


  const toggleExpand = (fieldKey) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const handleRevealClick = (fieldKey) => {
    setFieldToReveal(fieldKey);
    setPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = () => {
    revealFiscal(
      { password: passwordInput },
      {
        onSuccess: (fiscalNumber) => {
          setRevealedFields((prev) => ({
            ...prev,
            [fieldToReveal]: fiscalNumber,
          }));
          setPasswordDialogOpen(false);
          setPasswordInput("");
          setFieldToReveal(null);
        },
      }
    );
  };

  const ExpandableText = ({ fieldKey, value, isRecruiter = false }) => {
    const textRef = useRef(null);
    const [hasOverflow, setHasOverflow] = useState(false);
    const isExpanded = expandedFields[fieldKey];

    useEffect(() => {
      const element = textRef.current;
      if (!element) return;

      const checkOverflow = () => {
        const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
        const maxAllowedHeight = lineHeight * 2; // Exactly 2 lines
        const currentHeight = element.scrollHeight;

        setHasOverflow(currentHeight > maxAllowedHeight + 1);
      };

      checkOverflow();
      const resizeObserver = new ResizeObserver(checkOverflow);
      resizeObserver.observe(element);

      return () => resizeObserver.disconnect();
    }, [value]);

    return (
      <div className={styles.expandableTextContainer}>
        <p
          ref={textRef}
          className={`${isRecruiter ? styles.summaryTextRecruiter : styles.summaryText} ${!isExpanded && hasOverflow ? styles.truncated : ''
            }`}
          style={{
            maxHeight: !isExpanded && hasOverflow
              ? '3em'
              : 'none'
          }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
        {hasOverflow && (
          <button
            className={styles.seeMoreButton}
            onClick={() => toggleExpand(fieldKey)}
            aria-expanded={isExpanded}
            type="button"
          >
            {isExpanded ? 'See Less' : 'See More'}
          </button>
        )}
      </div>
    );
  };

  const renderFields = (fields = [], sectionKey = '') => {
    return (
      <div className={`${styles.fieldsWrapper} ${styles[sectionKey] || ''}`}>
        {fields.map((field) => {
          if (field.key === 'profilePicture') {
            return (
              <div key={field.key} className={`${styles.field} ${styles[field.className] || ''}`}>
                <ProfileImage
                  imageUrl={user?.[field.key] !== '—' ? user?.[field.key] : null}
                  styles={styles}
                  currentUser={user}
                />
              </div>
            );
          }

          const isRecruiterSummarySection = sectionKey === 'recruiterSummary';
          const shouldShowFieldRow = !['namePicSection', 'recruiterSummary'].includes(sectionKey);

          if (field.key === "fiscalNumber") {
            const isRevealed = revealedFields[field.key];
            return (
              <div
                key={field.key}
                className={[styles.field, styles[field.className] || '', shouldShowFieldRow ? styles.fieldRow : ''].filter(Boolean).join(' ')}
              >
                {field.icon && <field.icon className={styles.icon} />}
                <span className={styles.label}>{field.label || ''}</span>
                <span className={styles.value}>
                  {revealedFields[field.key]
                    ? revealedFields[field.key]
                    : user?.[field.key] === '—'
                      ? '—'
                      : '********'}
                  {!revealedFields[field.key] && user?.[field.key] !== '—' && (
                    <IconButton
                      onClick={() => handleRevealClick(field.key)}
                      edge="end" className={styles.showcodeButton}>
                      <EyeIcon className={styles.showcodeIcon} />
                    </IconButton>
                  )}
                </span>

              </div>
            );
          }

          return (
            <div
              key={field.key}
              className={[styles.field, styles[field.className] || '', shouldShowFieldRow ? styles.fieldRow : ''].filter(Boolean).join(' ')}
            >
              {field.icon && <field.icon className={styles.icon} />}
               {!isRecruiterSummarySection && <span className={styles.label}>{field.label || ''}</span>}
              {/* <span className={isRecruiterSummarySection ? styles.recruiterValue : (styles[field.className] || styles.value)}>
                {(field.key === 'summary' || field.key === 'recruiterSummary') && user?.[field.key] !== '—'
                  ? <ExpandableText
                    fieldKey={field.key}
                    value={user[field.key]}
                    isRecruiter={isRecruiterSummarySection}
                  />
                  : user?.[field.key] ?? '—'}
              </span> */}
              <span className={isRecruiterSummarySection ? styles.recruiterValue : (styles[field.className] || styles.value)}>
                {(field.key === 'summary' || field.key === 'recruiterSummary') && user?.[field.key] !== '—' ? (
                  <ExpandableText
                    fieldKey={field.key}
                    value={user[field.key]}
                    isRecruiter={isRecruiterSummarySection}
                  />
                ) : (
                  (() => {
                    const raw = user?.[field.key];
                    if (!raw || raw === '—') return '—';

                    if (field.key === 'companyWebsite') {
                      const href = (/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.externalLink}
                          aria-label={`Open ${raw} in a new tab`}
                        >
                          {raw}
                        </a>
                      );
                    }

                    return raw;
                  })()
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleEditOpen = (section) => setEditingSection(section);
  const handleDialogClose = () => setEditingSection(null);
  const handleDialogSave = (sectionKey, updatedValues) => {

    updateAccount(
      { sectionKey, values: updatedValues },
      {
        onSuccess: () => {
          setEditingSection(null);
        },
        onError: (err) => {
          console.error("Update failed:", err);
        },
      }
    );
  };


  const renderSection = (section) => {
    const cardClass = [
      styles.card,
      section.key === 'namePicSection' ? styles.namePicSectionCard : '',
      styles[section.cardClass] || '',
      styles[section.key] || ''
    ].filter(Boolean).join(' ');

    return (
      <AccountCard
        key={section.key}
        title={section.title || ''}
        styles={styles}
        onEdit={() => handleEditOpen(section)}
        className={cardClass}
      >
        {renderFields(section.fields, section.key)}
      </AccountCard>
    );
  };

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.left}>
        {basicInfosSections.map(renderSection)}
      </div>
      <div className={styles.right}>
        {profileSections.map(renderSection)}
      </div>

      {/* Edit dialog */}
      {editingSection && (
        <EditSectionDialog
          open={Boolean(editingSection)}
          section={editingSection}
          user={user}
          onClose={handleDialogClose}
          onSave={handleDialogSave}
          styles={styles}
        />
      )}

      {/* Password dialog for fiscal number using GenericDialog */}
      {passwordDialogOpen && (
        <GenericDialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          title="Enter Password"
          // styles={styles}
          // PaperProps={{ className: styles.dialogPaper }}
          styles={{
        dialogPaper: styles.dialogPaper,
        closeIcon: styles.closeIcon,
        closeIconButton: styles.closeIconButton,
        dialogHeader: styles.dialogHeaderRecruiter,
        titleText: styles.titleText,
      }}
        >
          <div className={styles.passwordDialogContent}>
            <GenericTextField
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter your password"
              styles={styles}
              required={true}
            />
            <div className={styles.actionButtons}>
              <GenericButton
                type="button"
                onClick={() => setPasswordDialogOpen(false)}
                className={styles.cancelButton}
              >
                Cancel
              </GenericButton>
              <GenericButton
                type="button"
                onClick={handlePasswordSubmit}
                className={styles.submitButton}
              >
                Submit
              </GenericButton>
            </div>
          </div>
        </GenericDialog>
      )}
    </div>
  );
}
