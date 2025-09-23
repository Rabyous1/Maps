// import React, { useState } from "react";
// import GenericButton from "@/components/ui/inputs/Button";
// import { formatDateRange } from "@/utils/functions";
// import IconLinkedin from '@/assets/icons/auth/icon-linkedin.svg';
// import ProfileImage from "./ProfileImage";
// import ProfileResume from "./ProfileResume";

// export default function InfoItem({
//   label,
//   value,
//   IconComponent,
//   styles = {},
//   fieldKey,
//   customRender,
//   className,
//   primaryFields = [],
//   secondaryFields = [],
//   showHrAfter = [],
//   sectionKey,
//   currentUser,
//   EmptyComponent
// }) {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const isEmpty = () => {
//     if (value === null || value === undefined) return true;
//     if (typeof value === "string" && value.trim() === "") return true;
//     if (Array.isArray(value) && value.length === 0) return true;
//     if (typeof value === "object" && Object.keys(value).length === 0) return true;
//     return false;
//   };

//   const renderFieldGroup = (entries, groupClass) => {
//     if (!entries.length) return null;
//     const startDateEntry = entries.find(([k]) => k === "startDate");
//     const endDateEntry = entries.find(([k]) => k === "endDate");
//     const otherEntries = entries.filter(([k]) => k !== "startDate" && k !== "endDate");

//     return (
//       <span className={groupClass}>
//         {otherEntries.map(([key, val]) => (
//           <span key={key} className={styles[`item-${key}`]}>
//             {String(val)}
//           </span>
//         ))}
//         {startDateEntry && (
//           <span className={styles["item-startDate"]}>
//             {formatDateRange(startDateEntry[1], endDateEntry?.[1])}
//           </span>
//         )}
//       </span>
//     );
//   };

//   const renderItem = (item, idx) => {
//     const isLastItem = value.length - 1 === idx;
//     if (item && typeof item === "object" && !Array.isArray(item)) {
//       const firstGroup = [];
//       const middleGroup = [];
//       const lastGroup = [];

//       Object.entries(item).forEach(([k, v]) => {
//         if (primaryFields.includes(k)) firstGroup.push([k, v]);
//         else if (secondaryFields.includes(k)) lastGroup.push([k, v]);
//         else middleGroup.push([k, v]);
//       });

//       return (
//         <React.Fragment key={idx}>
//           <span className={styles.arrayItem}>
//             {renderFieldGroup(firstGroup, styles.firstdiv)}
//             {renderFieldGroup(middleGroup, styles.seconddiv)}
//             {renderFieldGroup(lastGroup, styles.thirddiv)}
//           </span>
//           {showHrAfter.includes(sectionKey) && !isLastItem && (
//             <hr className={styles.itemSeparator} />
//           )}
//         </React.Fragment>
//       );
//     }
//     return (
//       <React.Fragment key={idx}>
//         <span className={styles.arrayItem}>{String(item)}</span>
//         {showHrAfter.includes(sectionKey) && !isLastItem && (
//           <hr className={styles.itemSeparator} />
//         )}
//       </React.Fragment>
//     );
//   };

//   const renderValue = () => {
//     if (customRender) return customRender(value);
//     if (fieldKey === "profilePicture") {
//       return (
//         <ProfileImage
//           imageUrl={value}
//           styles={styles}
//           currentUser={currentUser}
//         />
//       );
//     }
//     if (isEmpty()) {
//       return EmptyComponent ? <EmptyComponent styles={styles} /> : null;
//     }

//     switch (fieldKey) {
//       case "linkedinLink":
//         return (
//           <GenericButton
//             variant="outlined"
//             fullWidth
//             startIcon={<IconLinkedin className={styles.IconLinkedin} />}
//             onClick={() =>
//               window.open(
//                 value.startsWith("http") ? value : `https://${value}`,
//                 "_blank",
//                 "noopener,noreferrer"
//               )
//             }
//             className={styles.linkedinButton}
//           >
//             Linkedin account
//           </GenericButton>
//         );

//       case "summary":
//         const charsPerLine = 50;
//         const lineCount = value ? Math.ceil(value.length / charsPerLine) : 0;
//         const shouldTruncate = lineCount > 2;
//         return (
//           <>
//             <p
//               className={`${styles.summaryText} ${!isExpanded && shouldTruncate ? styles.truncated : ""}`}
//               dangerouslySetInnerHTML={{ __html: value }}
//             />
//             {shouldTruncate && (
//               <button className={styles.seeMoreButton} onClick={() => setIsExpanded(!isExpanded)}>
//                 {isExpanded ? "See Less" : "See More"}
//               </button>
//             )}
//           </>
//         );

//       case "cvUrl":
//         const fileName = value?.split("/").pop();
//         const fileObj = currentUser?.files?.find(
//           (f) => f.uuid === fileName || f.fileName === fileName
//         );
//         return (
//           <ProfileResume
//             currentUser={currentUser}
//             styles={styles}
//             cvUrl={value}
//             displayName={fileObj?.fileDisplayName || value}
//           />
//         );

// case "profilePicture": {
//       console.log("Rendering ProfileImage");
//       return (
//         <ProfileImage imageUrl={value} styles={styles} currentUser={currentUser} />
//       );
//     }



//       default:
//         if (Array.isArray(value)) {
//           return value.map(renderItem);
//         }
//         if (typeof value === "object") {
//           return <pre className={className}>{JSON.stringify(value, null, 2)}</pre>;
//         }
//         return <span className={className}>{String(value)}</span>;
//     }
//   };

//   return (
//     <div className={`${styles.textGroup} ${className || ''}`}>
//       {IconComponent && <IconComponent className={styles.icon} />}
//       {label && <span className={styles.label}>{label}</span>}
//       {renderValue()}
//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import GenericButton from "@/components/ui/inputs/Button";
import { formatDateRange } from "@/utils/functions";
import IconLinkedin from '@/assets/icons/auth/icon-linkedin.svg';
import ProfileImage from "./ProfileImage";
import ProfileResume from "./ProfileResume";

export default function InfoItem({
  label,
  value,
  IconComponent,
  styles = {},
  fieldKey,
  customRender,
  className,
  primaryFields = [],
  secondaryFields = [],
  showHrAfter = [],
  sectionKey,
  currentUser ,
  EmptyComponent
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (fieldKey !== 'summary') return;

    const checkOverflow = () => {
      if (textRef.current) {
        const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight);
        const maxHeight = lineHeight * 2; // 2 lines
        setHasOverflow(textRef.current.scrollHeight > maxHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [value, fieldKey]);

  const isEmpty = () => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === "object" && Object.keys(value).length === 0) return true;
    return false;
  };

  const renderFieldGroup = (entries, groupClass) => {
    if (!entries.length) return null;
    const startDateEntry = entries.find(([k]) => k === "startDate");
    const endDateEntry = entries.find(([k]) => k === "endDate");
    const otherEntries = entries.filter(([k]) => k !== "startDate" && k !== "endDate");

    return (
      <span className={groupClass}>
        {otherEntries.map(([key, val]) => (
          <span key={key} className={styles[`item-${key}`]}>
            {String(val)}
          </span>
        ))}
        {startDateEntry && (
          <span className={styles["item-startDate"]}>
            {formatDateRange(startDateEntry[1], endDateEntry?.[1])}
          </span>
        )}
      </span>
    );
  };

  const renderItem = (item, idx) => {
    const isLastItem = value.length - 1 === idx;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const firstGroup = [];
      const middleGroup = [];
      const lastGroup = [];

      Object.entries(item).forEach(([k, v]) => {
        if (primaryFields.includes(k)) firstGroup.push([k, v]);
        else if (secondaryFields.includes(k)) lastGroup.push([k, v]);
        else middleGroup.push([k, v]);
      });

      return (
        <React.Fragment key={idx}>
          <span className={styles.arrayItem}>
            {renderFieldGroup(firstGroup, styles.firstdiv)}
            {renderFieldGroup(middleGroup, styles.seconddiv)}
            {renderFieldGroup(lastGroup, styles.thirddiv)}
          </span>
          {showHrAfter.includes(sectionKey) && !isLastItem && (
            <hr className={styles.itemSeparator} />
          )}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment key={idx}>
        <span className={styles.arrayItem}>{String(item)}</span>
        {showHrAfter.includes(sectionKey) && !isLastItem && (
          <hr className={styles.itemSeparator} />
        )}
      </React.Fragment>
    );
  };

  const renderSummaryContent = () => {
    return (
      <>
        <p
          ref={textRef}
          className={`${styles.summaryText} ${!isExpanded && hasOverflow ? styles.truncated : ""}`}
          dangerouslySetInnerHTML={{ __html: value }}
        />
        {hasOverflow && (
          <button className={styles.seeMoreButton} onClick={() => setIsExpanded(prev => !prev)}>
            {isExpanded ? "See Less" : "See More"}
          </button>
        )}
      </>
    );
  };

  const renderValue = () => {
    if (customRender) return customRender(value);
    if (fieldKey === "profilePicture") {
      return (
        <ProfileImage
          imageUrl={value}
          styles={styles}
          currentUser ={currentUser }
        />
      );
    }
    
    if (isEmpty()) {
      return EmptyComponent ? <EmptyComponent styles={styles} /> : null;
    }

    switch (fieldKey) {
       case "linkedinLink":
        return (
          <GenericButton
            variant="outlined"
            fullWidth
            startIcon={<IconLinkedin className={styles.IconLinkedin} />}
            onClick={() =>
              window.open(
                value.startsWith("http") ? value : `https://${value}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className={styles.linkedinButton}
          >
            Linkedin account
          </GenericButton>
        );
case "linkedinLink":
  return (
    <GenericButton
      variant="outlined"
      fullWidth
      startIcon={<IconLinkedin className={styles.IconLinkedin} />}
      onClick={() =>
        value &&
        window.open(
          value.startsWith("http") ? value : `https://${value}`,
          "_blank",
          "noopener,noreferrer"
        )
      }
      className={styles.linkedinButton}
    >
      Linkedin account
    </GenericButton>
  );

      case "summary":
        return renderSummaryContent();

      case "cvUrl":
        const fileName = value?.split("/").pop();
        const fileObj = currentUser ?.files?.find(
          (f) => f.uuid === fileName || f.fileName === fileName
        );
        return (
          <ProfileResume
            currentUser ={currentUser }
            styles={styles}
            cvUrl={value}
            displayName={fileObj?.fileDisplayName || value}
          />
        );

      case "profilePicture":
        console.log("Rendering ProfileImage");
        return (
          <ProfileImage imageUrl={value} styles={styles} currentUser ={currentUser } />
        );

      default:
        if (Array.isArray(value)) {
          return value.map(renderItem);
        }
        if (typeof value === "object") {
          return <pre className={className}>{JSON.stringify(value, null, 2)}</pre>;
        }
        return <span className={className}>{String(value)}</span>;
    }
  };

  return (
    <div className={`${styles.textGroup} ${className || ''}`}>
      {IconComponent && <IconComponent className={styles.icon} />}
      {label && <span className={styles.label}>{label}</span>}
      {renderValue()}
    </div>
  );
}
