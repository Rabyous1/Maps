
'use client';
import React, { useState, useMemo, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Button, Typography } from "@mui/material";

import GenericFormikForm from "@/components/form/GenericFormikForm";
import GenericDialog from "@/components/ui/feedback/Dialog";
import { interviewFields } from "./interview.fields";

import { useAllInterviews, useAddInterview, useDeleteInterview, useUpdateInterview, useGetInterviewById } from "../../hooks/videoChat.hooks";
import { InterviewSchema } from "../../validations/videoChat.validations";
import { useJobsWithApplications, useCandidatesList } from "@/features/applications/hooks/applications.hooks";
import DeleteConfirmationDialog from "@/components/dialogs/DeleteConfirmationDialog";
import GenericCard from "@/components/ui/surfaces/Card";

export default function Calendar({styles}) {
  const { data: interviewsData, isLoading: isInterviewsLoading } = useAllInterviews();
  const addInterviewMutation = useAddInterview();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const deleteInterviewMutation = useDeleteInterview();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

const { data: interviewDetails, isLoading: isDetailsLoading, isError: isDetailsError } =
  useGetInterviewById(selectedInterview?.id, { enabled: !!selectedInterview?.id});



  const DEFAULT_TIME = "19:00";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialValues, setInitialValues] = useState({
    opportunityId: "",
    applicationId: "",
    notes: "",
    durationMinutes: 60,
    date: "", 
    time: "DEFAULT_TIME", 
    type: "video",
  });

  const formKey = `${dialogOpen}-${initialValues.date}-${initialValues.opportunityId}-${initialValues.time}`;

  const [selectedJobId, setSelectedJobId] = useState(null);
  const JOB_PAGE_SIZE = 4;
  const CAND_PAGE_SIZE = 4;

  const [jobPage, setJobPage] = useState(1);
  const [allJobs, setAllJobs] = useState([]);
  const jobsQuery = useJobsWithApplications(jobPage, JOB_PAGE_SIZE, { onlyOpenJobs: true });
  const jobLoadInProgress = useRef(false);

  const [candPage, setCandPage] = useState(1);
  const [allCandidates, setAllCandidates] = useState([]);
  const updateInterviewMutation = useUpdateInterview();

  const candQuery = useCandidatesList(
    selectedJobId || null,
    { pageNumber: candPage, pageSize: CAND_PAGE_SIZE, excludeScheduled: true },
    { enabled: !!selectedJobId }
  );
  const candLoadInProgress = useRef(false);

  useEffect(() => {
    const fetched = jobsQuery?.data?.jobs ?? [];
    if (Array.isArray(fetched) && fetched.length) {
      setAllJobs((prev) => {
        const existing = new Set(prev.map((j) => j.opportunityId));
        return [...prev, ...fetched.filter((j) => !existing.has(j.opportunityId))];
      });
    }
    if (!jobsQuery.isFetching) jobLoadInProgress.current = false;
  }, [jobsQuery.data, jobsQuery.isFetching]);

  useEffect(() => {
    const fetched = candQuery?.data?.candidates ?? [];
    if (Array.isArray(fetched) && fetched.length) {
      setAllCandidates((prev) => {
        const existing = new Set(prev.map((c) => c.applicationId));
        return [...prev, ...fetched.filter((c) => !existing.has(c.applicationId))];
      });
    }
    if (!candQuery.isFetching) candLoadInProgress.current = false;
  }, [candQuery.data, candQuery.isFetching]);

  const jobOptions = useMemo(() => {
    const source = allJobs.length ? allJobs : (jobsQuery?.data?.jobs ?? []);
    const items = source.map((job) => ({ label: job.jobTitle || job.opportunityId, value: job.opportunityId }));
    const totalPages = jobsQuery?.data?.totalPages ?? 1;
    if (jobPage < totalPages) items.push({ label: "Load more job offers…", value: "__load_more_jobs__" });
    return items;
  }, [allJobs, jobsQuery?.data, jobPage]);

  const candidateOptions = useMemo(() => {
    if (!selectedJobId) return [];
    const source = allCandidates.length ? allCandidates : (candQuery?.data?.candidates ?? []);
    const items = source.map((it) => ({ label: it?.candidate?.fullName || it?.candidate?.email || it?.applicationId, value: it.applicationId }));
    const totalPages = candQuery?.data?.totalPages ?? 1;
    if (candPage < totalPages) items.push({ label: "Load more candidates…", value: "__load_more_candidates__" });
    return items;
  }, [allCandidates, candQuery?.data, candPage, selectedJobId]);

  const events = useMemo(
    () => (interviewsData || []).map((iv) => {
      const start = iv.date;
      const end = new Date(new Date(iv.date).getTime() + (Number(iv.durationMinutes) || 0) * 60000).toISOString();
      return { id: iv.id, title: `Interview - ${iv.candidate?.fullName || iv.candidate?.name || "Candidate"}`, start, end };
    }),
    [interviewsData]
  );

  const formatDateTimeLocal = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  const findConflictingInterview = (dateISODay, timeHHmm, durationMinutes = 60) => {
    if (!dateISODay || !timeHHmm) return null;
    try {
      const baseDay = new Date(dateISODay);
      const year = baseDay.getFullYear();
      const month = baseDay.getMonth();
      const day = baseDay.getDate();
      const [hh = "0", mm = "0"] = (timeHHmm || DEFAULT_TIME).split(":");
      const candidateStart = new Date(year, month, day, Number(hh), Number(mm), 0, 0);
      const candidateEnd = new Date(candidateStart.getTime() + Number(durationMinutes || 0) * 60000);

      const list = interviewsData || [];
      for (const iv of list) {
        if (!iv?.date) continue;
        const ivStart = new Date(iv.date);
        const ivDuration = Number(iv.durationMinutes) || 0;
        const ivEnd = new Date(ivStart.getTime() + ivDuration * 60000);

        if (candidateStart < ivEnd && candidateEnd > ivStart) {
          return { iv, ivStart, ivEnd };
        }
      }
      return null;
    } catch (e) {
      console.error("Conflict check failed", e);
      return null;
    }
  };

  const [timeConflictInfo, setTimeConflictInfo] = useState(null);

  useEffect(() => {
    if (!initialValues?.date || !initialValues?.time) {
      setTimeConflictInfo(null);
      return;
    }
    const conflict = findConflictingInterview(initialValues.date, initialValues.time, initialValues.durationMinutes);
    if (conflict) {
      setTimeConflictInfo(conflict);
    } else {
      setTimeConflictInfo(null);
    }
  }, [initialValues.date, initialValues.time, initialValues.durationMinutes, interviewsData]);

  const handleSubmit = (values, formikHelpers) => {
    const duration = Number(values.durationMinutes || 60);

    const conflict = findConflictingInterview(values.date, values.time, duration);
    if (conflict) {
      formikHelpers.setFieldError("time", "This time conflicts with an existing interview.");
      formikHelpers.setSubmitting(false);
      return;
    }

    const baseDay = new Date(values.date);
    const year = baseDay.getFullYear();
    const month = baseDay.getMonth(); 
    const day = baseDay.getDate();

    const [hh = "0", mm = "0"] = (values.time || DEFAULT_TIME).split(":");
    const combinedLocal = new Date(year, month, day, Number(hh), Number(mm), 0, 0);
    const isoToSend = combinedLocal.toISOString(); 

    const payload = {
      applicationId: values.applicationId,
      date: isoToSend,
      durationMinutes: duration,
      type: values.type,
      notes: values.notes,
    };

    addInterviewMutation.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
        formikHelpers.resetForm();
      },
      onError: (err) => {
        console.error("[Interview Add ERROR]", err);
        formikHelpers.setSubmitting(false);
      },
    });
  };

  const renderFields = () => {
    const base = interviewFields(jobOptions, candidateOptions) || [];

    return base.map((field) => {
      if (!field) return field;

      if (field.name === "opportunityId") {
        return {
          ...field,
          onChange: (e, setFieldValue) => {
            const val = e?.target?.value;

            if (val === "__load_more_jobs__") {
              if (jobLoadInProgress.current) return;
              jobLoadInProgress.current = true;
              setJobPage((p) => p + 1);
              return;
            }

            setCandPage(1);
            setAllCandidates([]);
            setSelectedJobId(val || null);
            setFieldValue("opportunityId", val);
            setFieldValue("applicationId", ""); // reset candidate
            setInitialValues((prev) => ({ ...prev, opportunityId: val }));
          },
        };
      }

      if (field.name === "applicationId") {
        return {
          ...field,
          onChange: (e, setFieldValue) => {
            const val = e?.target?.value;
            if (val === "__load_more_candidates__") {
              if (candLoadInProgress.current) return;
              candLoadInProgress.current = true;
              setCandPage((p) => p + 1);
              return;
            }
            setFieldValue("applicationId", val);
            setInitialValues((prev) => ({ ...prev, applicationId: val }));
          },
        };
      }

      // if (field.name === "time") {
      //   const isToday = initialValues.date &&
      //     new Date(initialValues.date).toDateString() === new Date().toDateString();

      //   let helper = field.helperText ?? "";
      //   let isError = false;
      //   if (timeConflictInfo) {
      //     isError = true;
      //     const conflictingIv = timeConflictInfo.iv;
      //     const conflictingStart = timeConflictInfo.ivStart;
      //     helper = `Conflicts with: ${conflictingIv?.candidate?.fullName || conflictingIv?.candidate?.name || 'another interview'} — ${formatDateTimeLocal(conflictingStart)}.`;
      //   }

      //   return {
      //     ...field,
      //     inputProps: isToday
      //       ? {
      //           min: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      //         }
      //       : {},
      //     onChange: (e, setFieldValue) => {
      //       const val = e?.target?.value;
      //       setFieldValue("time", val);
      //       setInitialValues((prev) => ({ ...prev, time: val }));
      //     },
      //     helperText: helper,
      //     error: isError,
      //   };
      // }
      if (field.name === "time") {
  const isToday = initialValues.date &&
    new Date(initialValues.date).toDateString() === new Date().toDateString();

  let conflictHelper = "";
  let conflictError = false;
  if (timeConflictInfo) {
    conflictError = true;
    const conflictingIv = timeConflictInfo.iv;
    const conflictingStart = timeConflictInfo.ivStart;
    conflictHelper = `Conflicts with: ${conflictingIv?.candidate?.fullName || conflictingIv?.candidate?.name || 'another interview'} — ${formatDateTimeLocal(conflictingStart)}.`;
  }

  return {
    ...field,
    inputProps: isToday ? { min: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : {},
    onChange: (e, setFieldValue, setFieldTouched) => {
      const val = e?.target?.value;
      setFieldValue("time", val);
      if (typeof setFieldTouched === "function") setFieldTouched("time", true, false);
      setInitialValues((prev) => ({ ...prev, time: val }));
    },
    conflictHelper,
    conflictError,
  };
}


      return field;
    });
  };

  if (isInterviewsLoading) return <div>Loading calendar data...</div>;

  // const formattedSelectedDay = () => {
  //   try {
  //     if (!initialValues.date) return "";
  //     const d = new Date(initialValues.date);
  //     return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  //   } catch {
  //     return "";
  //   }
  // };
  const formattedSelectedDay = () => {
  try {
    if (!initialValues.date) return "";
    const d = new Date(initialValues.date);
    return d.toLocaleDateString("en-US", {
      weekday: "short", 
      year: "numeric",
      month: "short",  
      day: "numeric",  
    });
  } catch {
    return "";
  }
};


  return (
    <>
    <GenericCard styles={styles} className={styles.calendar}>
      <FullCalendar
      className={styles.calendarWrapper}
//       validRange={{
//   start: new Date().toISOString().split("T")[0], // block past days
// }}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        editable
        events={events}
  //       eventContent={(arg) => {
  //   const color = arg.event.extendedProps?.dotColor ?? "#1976d2";
  //   return (
  //     <div className="fc-custom-event" style={{ "--dot-color": color }}>
  //       <span className="fc-dot" aria-hidden="true" />
  //       <div className="fc-title">{arg.event.title}</div>
  //     </div>
  //   );
  // }}
  eventContent={(arg) => {
  const color = arg.event.extendedProps?.dotColor ?? "#1976d2";
  const startTime = arg.timeText || new Date(arg.event.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="fc-custom-event" style={{ "--dot-color": color }}>
      <span className="fc-dot" aria-hidden="true" />
      <span className="fc-time">{startTime}</span>
      <div className="fc-title">{arg.event.title}</div>
    </div>
  );
}}

        dateClick={(info) => {
          const clickedDate = new Date(info.date);
          clickedDate.setHours(0, 0, 0, 0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
// Ignore past dates
          if (clickedDate < today) {
            return; 
          }

          setInitialValues({
            opportunityId: "",
            applicationId: "",
            notes: "",
            durationMinutes: 60,
            date: clickedDate.toISOString(),
            time: DEFAULT_TIME,
            type: "video",
          });

          setSelectedJobId(null);
          setAllCandidates([]);
          setCandPage(1);
          setDialogOpen(true);
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
        dayCellDidMount={(info) => {
          
          const cellDate = new Date(info.date);
          cellDate.setHours(0, 0, 0, 0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (cellDate < today) {
            info.el.setAttribute("title", "This date is in the past and cannot be selected");
            info.el.style.opacity = "0.5";
            info.el.style.cursor = "not-allowed";
          }
        }}
        eventClick={(info) => {
          const interviewId = info.event.id;
          const interviewTitle = info.event.title;

          setSelectedInterview({ id: interviewId, title: interviewTitle });
          // setDeleteDialogOpen(true);
          setDetailsDialogOpen(true); 
        }}
        eventClassNames={() => [styles.interviewEvent]} 
  dayCellClassNames={(arg) => {
    const hasEvent = events.some(
      (ev) =>
        new Date(ev.start).toDateString() === arg.date.toDateString()
    );
    return hasEvent ? [styles.cellWithInterview] : [styles.emptyCell];
  }}
  eventDrop={(info) => {
  try {
    const interviewId = info.event.id;
    const newDropDate = info.event.start;

    if (!interviewId || !newDropDate) {
      if (typeof info.revert === "function") info.revert();
      return;
    }

    const original = (interviewsData || []).find(iv => String(iv.id) === String(interviewId));
    if (!original) {
      const iso = newDropDate.toISOString();
      updateInterviewMutation.mutate({ id: interviewId, date: iso }, {
        onError: (err) => { console.error("Update failed", err); if (typeof info.revert === "function") info.revert(); }
      });
      return;
    }

    const originalDate = new Date(original.date);
    const hh = originalDate.getHours();
    const mm = originalDate.getMinutes();

    const combined = new Date(
      newDropDate.getFullYear(),
      newDropDate.getMonth(),
      newDropDate.getDate(),
      hh,
      mm,
      0, 0
    );

    const isoToSend = combined.toISOString();

    updateInterviewMutation.mutate({ id: interviewId, date: isoToSend }, {
      onError: (err) => {
        console.error("Failed to update interview date", err);
        if (typeof info.revert === "function") info.revert();
      },
    });
  } catch (e) {
    console.error("eventDrop handler error", e);
    if (typeof info.revert === "function") info.revert();
  }
}}
eventAllow={(dropInfo) => {
  const newStart = dropInfo.start;
  if (!newStart) return false;

  const now = new Date();

  return newStart >= now;
}}

      />

      
      <GenericDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Schedule Interview" fullWidth contentClassName={styles.dialogContentWrapperForm} styles={{
        dialogPaper: styles.dialogPaper,
        closeIcon: styles.closeIcon,
        closeIconButton: styles.closeIconButton,
        dialogHeader: styles.dialogHeader,
        titleText: styles.titleText,
      }}>
          <span className={styles.subTitleDialog}>
            {initialValues.date ? `Selected day: ${formattedSelectedDay()}` : ""}
          </span>

          <GenericFormikForm
            key={formKey}
            styles={styles}
            initialValues={{
              ...initialValues,
              opportunityId: initialValues.opportunityId || (selectedJobId ?? ""),
            }}
            validationSchema={InterviewSchema}
            onSubmit={handleSubmit}
            fields={renderFields()}
            submitText={addInterviewMutation.isLoading ? "Scheduling..." : "Schedule Interview"}
            cancelText="Cancel"
            onCancel={() => setDialogOpen(false)}
            isSubmitting={addInterviewMutation.isLoading}
        formClassName={styles.dialogForm}

          />
      </GenericDialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        itemName={selectedInterview?.title || "this interview"}
        onDelete={() => {
          if (!selectedInterview) return;
          deleteInterviewMutation.mutate(selectedInterview.id, {
            onSuccess: () => {
              setDeleteDialogOpen(false);
              setSelectedInterview(null);
            },
            onError: (err) => {
              console.error("Delete failed", err);
            },
          });
        }}
      />
      <GenericDialog
  open={detailsDialogOpen}
  onClose={() => setDetailsDialogOpen(false)}
  title="Interview Details"
  fullWidth
  PaperProps={{ className: styles.dialogPaperDetails }}
  contentClassName={styles.dialogContentWrapperForm} styles={{
        dialogPaper: styles.dialogPaperDetails,
        closeIcon: styles.closeIcon,
        closeIconButton: styles.closeIconButton,
        dialogHeader: styles.dialogHeader,
        titleText: styles.titleText,
      }}>
  {selectedInterview && (
    <>
      {isDetailsLoading && <div>Loading...</div>}
  {isDetailsError && <div>Error loading details.</div>}
  {interviewDetails && (
    <div className={styles.contentDialog}>
      <span>
    <span className={styles.label}>Candidate: </span>
    <span className={styles.value}>{interviewDetails.candidate?.fullName}</span>
  </span>

  <span>
    <span className={styles.label}>Opportunity reference: </span>
    <span className={styles.value}>{interviewDetails.opportunity.reference}</span>
  </span>
  <span>
    <span className={styles.label}>Opportunity title: </span>
    <span className={styles.value}>
  {interviewDetails.opportunity?.OpportunityVersions?.[0]?.title || "Titre non disponible"}
</span>

  </span>
  <span>
    <span className={styles.label}>Date: </span>
    <span className={styles.value}>{new Date(interviewDetails.date).toLocaleString()}</span>
  </span>

  <span>
    <span className={styles.label}>Duration: </span>
    <span className={styles.value}>{interviewDetails.durationMinutes} min</span>
  </span>

  <span>
    <span className={styles.label}>Notes: </span>
    <span className={styles.value}>{interviewDetails.notes || "—"}</span>
  </span>
      <div className={styles.actionButtonsDialog}>
      <Button onClick={() => { setDetailsDialogOpen(false);}} className={styles.cancelButton}>
          Cancel
        </Button>
<Button onClick={() => { setDetailsDialogOpen(false); setDeleteDialogOpen(true); }} className={styles.submitbutton}>
          Delete
        </Button>
      </div>
    </div>
  )}

    </>
  )}
</GenericDialog>
      </GenericCard>
    </>
  );
}
