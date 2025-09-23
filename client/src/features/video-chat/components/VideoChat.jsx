
// 'use client';

// import React, { useEffect, useRef, useState } from "react";
// import { Box, Button, CircularProgress, IconButton, Checkbox, Tooltip } from "@mui/material";
// import { useMessagedUsers } from "@/features/user/hooks/users.hooks";
// import UserActions from "./UserActions";
// import VideoCall from "./VideoCall";
// import GenericCard from "@/components/ui/surfaces/Card";
// import ProfilePicture from "@/features/messages/components/ProfilePicture";
// import PreviousIcon from '@/assets/icons/notifications/left-arrow.svg';
// import NextIcon from '@/assets/icons/notifications/right-arrow.svg';

// import {
//   RadioButtonUnchecked as OutlinedIcon,
//   CheckCircleOutline as CheckedIcon
// } from '@mui/icons-material';
// import EndCallDialog from "./RatingDialog";
// import { useCandidatesListRec } from "@/features/applications/hooks/applications.hooks";

// const LOG = '[VideoChat]';

// export default function VideoChat({ styles }) {
//   const [targetUserId, setTargetUserId] = useState("");
//   const [targetUser, setTargetUser] = useState(null);
//   const [selectedId, setSelectedId] = useState("");
//   const [pageNumber, setPageNumber] = useState(1);
//   const pageSize = 5;

//   const { data, isLoading, isError, error, refetch, isFetching } = useMessagedUsers({
//     page: pageNumber,
//     pageSize,
//   });
//   const {
//     data: candidatesData,
//     isLoading: isCandidatesLoading,
//     isError: isCandidatesError,
//     error: candidatesError,
//     refetch: refetchCandidates,
//     isFetching: isCandidatesFetching
//   } = useCandidatesListRec({
//     page: pageNumber,
//     pageSize
//   });

//   useEffect(() => {
//     console.log('[VideoChat] candidatesData:', candidatesData);
//     console.log('[VideoChat] isCandidatesLoading:', isCandidatesLoading);
//     console.log('[VideoChat] isCandidatesFetching:', isCandidatesFetching);
//     console.log('[VideoChat] isCandidatesError:', isCandidatesError);
//     if (candidatesError) console.error('[VideoChat] candidatesError:', candidatesError);
//   }, [candidatesData, isCandidatesLoading, isCandidatesFetching, isCandidatesError, candidatesError]);


//   const users = Array.isArray(data?.users) ? data.users : [];
//   const totalPages = data?.totalPages ?? 1;
//   const wrapper2Ref = useRef(null);     // ref for the scrollable container (.wrapper2)
//   const videoCallRef = useRef(null);    // ref for the VideoCall area

//   // helper: find nearest scrollable ancestor (or document scrolling element)
//   const findScrollableParent = (el) => {
//     let parent = el?.parentElement;
//     while (parent) {
//       const style = window.getComputedStyle(parent);
//       const overflowY = style.overflowY;
//       if ((overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight) {
//         return parent;
//       }
//       parent = parent.parentElement;
//     }
//     return document.scrollingElement || document.documentElement;
//   };

//   // robust scroll: waits a frame then scrolls nearest scrollable ancestor
//   const scrollToVideoCall = (opts = { behavior: "smooth", block: "end" }) => {
//     const videoEl = videoCallRef.current;
//     if (!videoEl) {
//       console.warn(LOG, "scrollToVideoCall: videoEl not found (no ref).");
//       return;
//     }

//     requestAnimationFrame(() => {
//       const scrollParent = findScrollableParent(videoEl);
//       if (!scrollParent) {
//         console.warn(LOG, "scrollToVideoCall: no scroll parent found, fallback to scrollIntoView.");
//         videoEl.scrollIntoView({ behavior: opts.behavior, block: opts.block });
//         return;
//       }

//       const videoRect = videoEl.getBoundingClientRect();
//       const parentRect = scrollParent.getBoundingClientRect();
//       const currentScrollTop = scrollParent.scrollTop;
//       const offsetTopRelative = videoRect.top - parentRect.top + currentScrollTop;

//       const padding = 16; // px, adjust as needed
//       const target = Math.max(0, offsetTopRelative - (scrollParent.clientHeight - videoRect.height) - padding);

//       console.debug(LOG, {
//         scrollParent,
//         parentClientHeight: scrollParent.clientHeight,
//         videoHeight: videoRect.height,
//         offsetTopRelative,
//         target,
//       });

//       scrollParent.scrollTo({ top: target, behavior: opts.behavior });
//     });
//   };

//   const handleSelectToggle = (user, checked) => {
//     if (checked) {
//       setSelectedId(user.id);
//       setTargetUserId(user.id);
//       setTargetUser(user);
//     } else {
//       setSelectedId("");
//       setTargetUserId("");
//       setTargetUser(null);
//     }
//   };

//   const handleCardClick = (user) => {
//     if (selectedId === user.id) {
//       setSelectedId("");
//       setTargetUserId("");
//       setTargetUser(null);
//     } else {
//       setSelectedId(user.id);
//       setTargetUserId(user.id);
//       setTargetUser(user);
//     }
//   };

//   if (isLoading || !data) {
//     return (
//       <div className={styles.loadingContainer}>
//         <CircularProgress size={24} />
//       </div>
//     );
//   }

//   if (isError) {
//     console.error(LOG, "isError ->", error);
//     return (
//       <div className={styles.errorContainer}>
//         <p color="error">
//           {error?.message || "Error loading users"}
//         </p>
//         <Button
//           variant="outlined"
//           onClick={() => {
//             console.log(LOG, "manual retry/refetch triggered");
//             refetch();
//           }}
//         >
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.wrapper}>
//       <div className={styles.wrapper2} ref={wrapper2Ref}>
//         <p className={styles.userListTitle}>
//           Available Users for Video Interviews
//         </p>
//         <Box className={styles.userList}>
//           {users.map((user) => (
//             <GenericCard
//               key={user.id}
//               onClick={() => handleCardClick(user)}
//               styles={styles}
//               className={selectedId === user.id ? styles.selectedCard : ""}
//             >
//               <div className={styles.firstRow}>
//                 <div className={styles.firstRowPart1}>
//                   <ProfilePicture
//                     filename={user.profilePicture?.split("/").pop()}
//                     fullName={user.fullName}
//                     styles={styles}
//                     isOnline={false}
//                     hasBorder
//                     forceGray={false}
//                   />
//                   <div className={styles.firstRowPart1Text}>
//                     <p className={styles.userName}>{user.fullName}</p>
//                     <p className={styles.email}>{user.email}</p>
//                   </div>
//                 </div>
//                 <Tooltip title="Select this user to start a video interview." arrow>
//                   <Checkbox
//                     className={styles.userCheckbox}
//                     icon={<OutlinedIcon />}
//                     checkedIcon={<CheckedIcon />}
//                     checked={selectedId === user.id}
//                     onClick={(e) => e.stopPropagation()}
//                     onChange={(e) => handleSelectToggle(user, e.target.checked)}
//                   />
//                 </Tooltip>
//               </div>
//               <div className={styles.firstRowPart2}>
//                 <p className={styles.location}>{user.country}</p>
//                 <p className={styles.targetRole}>
//                   {user.targetRole}
//                 </p>
//               </div>
//             </GenericCard>
//           ))}
//         </Box>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className={styles.pagination}>
//             <IconButton
//               onClick={() => {
//                 const next = Math.max(pageNumber - 1, 1);
//                 setPageNumber(next);
//               }}
//               disabled={pageNumber === 1}
//               className={styles.paginationBtn}
//             >
//               <PreviousIcon className={styles.paginationIcons} />
//             </IconButton>

//             <span className={styles.paginationText}>
//               Page {pageNumber} of {totalPages} {isFetching ? "(fetching...)" : ""}
//             </span>

//             <IconButton
//               onClick={() => {
//                 const next = Math.min(pageNumber + 1, totalPages);
//                 console.log(LOG, "Next clicked -> setting pageNumber to", next);
//                 setPageNumber(next);
//               }}
//               disabled={pageNumber === totalPages}
//               className={styles.paginationBtn}
//             >
//               <NextIcon className={styles.paginationIcons} />
//             </IconButton>
//           </div>
//         )}

//         {targetUserId && <UserActions userId={targetUserId} fullName={targetUser.fullName}
//           profilePicture={targetUser.profilePicture} styles={styles} onStartCall={() => {
//             scrollToVideoCall();
//           }} />}

//         <div ref={videoCallRef} id="video-call-anchor">
//           <VideoCall styles={styles} targetUser={targetUser} />
//           <EndCallDialog styles={styles} targetUser={targetUser}/>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, Checkbox, Tooltip } from "@mui/material";
import UserActions from "./UserActions";
import VideoCall from "./VideoCall";
import GenericCard from "@/components/ui/surfaces/Card";
import ProfilePicture from "@/features/messages/components/ProfilePicture";
import { RadioButtonUnchecked as OutlinedIcon, CheckCircleOutline as CheckedIcon } from '@mui/icons-material';
import EndCallDialog from "./RatingDialog";
import { useCandidatesListRec } from "@/features/applications/hooks/applications.hooks";
import Select from "@/components/ui/inputs/Select";

const LOG = "[VideoChat]";

export default function VideoChat({ styles }) {
  const [selectedJobId, setSelectedJobId] = useState(""); 
  const [targetCandidate, setTargetCandidate] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;
  const [allJobOffers, setAllJobOffers] = useState([]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useCandidatesListRec({ page: pageNumber, pageSize });

  const wrapperRef = useRef(null);   
  const videoCallRef = useRef(null); 

  useEffect(() => {
    if (data?.jobOffers?.length) {
      if (pageNumber === 1) {
        setAllJobOffers(data.jobOffers);
      } else {
        setAllJobOffers(prev => [...prev, ...data.jobOffers]);
      }
    }
  }, [data, pageNumber]);

  const findScrollableParent = (el) => {
    if (!el) return document.scrollingElement || document.documentElement;
    let parent = el.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      if ((overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  };

  const scrollToVideoCall = (opts = { behavior: "smooth", block: "end", padding: 16 }) => {
    const videoEl = videoCallRef.current;
    if (!videoEl) {
      console.warn(LOG, "scrollToVideoCall: videoEl not found (no ref).");
      return;
    }

    requestAnimationFrame(() => {
      const scrollParent = findScrollableParent(videoEl);
      if (!scrollParent) {
        console.warn(LOG, "scrollToVideoCall: no scroll parent found, fallback to scrollIntoView.");
        videoEl.scrollIntoView({ behavior: opts.behavior, block: opts.block });
        return;
      }

      const videoRect = videoEl.getBoundingClientRect();
      const parentRect = scrollParent.getBoundingClientRect();
      const currentScrollTop = scrollParent.scrollTop;
      const offsetTopRelative = videoRect.top - parentRect.top + currentScrollTop;

      const target = Math.max(0, offsetTopRelative - (scrollParent.clientHeight - videoRect.height) + opts.padding);

      console.debug(LOG, {
        scrollParent,
        parentClientHeight: scrollParent.clientHeight,
        videoHeight: videoRect.height,
        offsetTopRelative,
        target,
      });

      scrollParent.scrollTo({ top: target, behavior: opts.behavior });
    });
  };

  const handleJobSelect = (jobId) => {
    if (jobId === "__load_more__") {
      setPageNumber(prev => prev + 1);
      return;
    }

    setSelectedJobId(jobId);
    setTargetCandidate(null);
    setSelectedCandidateId("");
  };

  const handleCandidateSelect = (candidate) => {
    if (selectedCandidateId === String(candidate.id)) {
      setSelectedCandidateId("");
      setTargetCandidate(null);
    } else {
      setSelectedCandidateId(String(candidate.id));
      setTargetCandidate(candidate);
    }
  };

  if (isLoading || !data) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress size={24} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <p color="error">{error?.message || "Error loading job offers"}</p>
        <Button variant="outlined" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const jobOptions = allJobOffers.map(j => ({
    value: String(j.job.id),
    label: j.job.jobTitle,
    meta: j, 
  }));

  const totalPages = data?.totalPages ?? 1;
  if (pageNumber < totalPages) {
    jobOptions.push({ value: "__load_more__", label: "Load more..." });
  }

  const effectiveSelectedJobId = selectedJobId || (jobOptions[0]?.value ?? "");
  const selectedJob = allJobOffers.find(j => String(j.job.id) === effectiveSelectedJobId) ?? allJobOffers[0];
const targetApplication = selectedJob?.candidates.find(
  (c) => c.candidate.id === targetCandidate?.id
);
const resetJobSelection = () => {
  setSelectedJobId("");
  setTargetCandidate(null);
  setSelectedCandidateId("");
};

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.wrapper2}>
         <p className={styles.userListTitle}>
           Connect for Interviews
         </p>
        <Select
          name="jobOffer"
          // label="Select Job Offer"
          value={effectiveSelectedJobId}
          options={jobOptions}
          onChange={(e) => handleJobSelect(String(e.target.value))}
          placeholder="Select a job"
          styles={styles}
          clearable
          onClear={() => handleJobSelect("")}
        />

        <Box className={styles.userList}>
          {(selectedJob?.candidates || []).map(c => (
            <GenericCard
              key={c.candidate.id}
              onClick={() => handleCandidateSelect(c.candidate)}
              styles={styles}
              className={selectedCandidateId === String(c.candidate.id) ? styles.selectedCard : ""}
            >
              <div className={styles.firstRow}>
                 <div className={styles.firstRowPart1}>
                <ProfilePicture
                  filename={c.candidate.profilePicture?.split("/").pop()}
                  fullName={c.candidate.fullName}
                  styles={styles}
                  isOnline={false}
                  hasBorder
                  forceGray={false}
                />
                <div className={styles.firstRowPart1Text}>
                  <p className={styles.userName}>{c.candidate.fullName}</p>
                  <p className={styles.email}>{c.candidate.email}</p>
                </div>
                </div>
                <Tooltip title="Select this candidate">
                  <Checkbox
                    className={styles.userCheckbox}
                    icon={<OutlinedIcon />}
                    checkedIcon={<CheckedIcon />}
                    checked={selectedCandidateId === String(c.candidate.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleCandidateSelect(c.candidate)}
                  />
                </Tooltip>
              </div>
               <div className={styles.firstRowPart2}>
                 <p className={styles.location}>{c.candidate.country}</p>
                 <p className={styles.targetRole}>
                   {c.candidate.targetRole}
                 </p>
               </div>
            </GenericCard>
          ))}
        </Box>

        {targetCandidate && (
          <UserActions
            userId={targetCandidate.id}
            fullName={targetCandidate.fullName}
            profilePicture={targetCandidate.profilePicture}
            styles={styles}
            onStartCall={() => {
              setTimeout(() => scrollToVideoCall({ behavior: "smooth", block: "end", padding: 16 }), 50);
            }}
          />
        )}

        <div ref={videoCallRef} id="video-call-anchor">
          <VideoCall styles={styles} targetUser={targetCandidate} />
          <EndCallDialog styles={styles} targetUser={targetCandidate} applicationId={targetApplication?.applicationId} onStatusUpdated={resetJobSelection}
/>
        </div>
      </div>
    </div>
  );
}
