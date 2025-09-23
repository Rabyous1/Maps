"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Select from "@/components/ui/inputs/Select";
import { useCandidatesList, useJobsWithApplications } from "@/features/applications/hooks/applications.hooks";

export default function JobAndCandidateFields({ values, setFieldValue, styles = {} }) {
  const JOB_PAGE_SIZE = 4;
  const CAND_PAGE_SIZE = 4;

  const [jobPage, setJobPage] = useState(1);
  const [allJobs, setAllJobs] = useState([]);
  const jobsQuery = useJobsWithApplications(jobPage, JOB_PAGE_SIZE, { onlyOpenJobs: true });

  const jobLoadInProgress = useRef(false);

  const opportunityId = values.opportunityId || "";
  const [candPage, setCandPage] = useState(1);
  const [allCandidates, setAllCandidates] = useState([]);
//   const candQuery = useCandidatesList(
//     opportunityId || null,
//     { pageNumber: candPage, pageSize: CAND_PAGE_SIZE },
//     { enabled: !!opportunityId }
//   );
const candQuery = useCandidatesList(
  opportunityId || null,
  { 
    pageNumber: candPage, 
    pageSize: CAND_PAGE_SIZE, 
    excludeScheduled: true 
  },
  { enabled: !!opportunityId }
);


  const candLoadInProgress = useRef(false);

  useEffect(() => {
    const fetched = jobsQuery?.data?.jobs ?? [];
    if (Array.isArray(fetched) && fetched.length) {
      setAllJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.opportunityId));
        const newJobs = fetched.filter((j) => !existingIds.has(j.opportunityId));
        if (jobLoadInProgress.current) jobLoadInProgress.current = false;
        return [...prev, ...newJobs];
      });
    } else {
      if (jobLoadInProgress.current) jobLoadInProgress.current = false;
    }
  }, [jobsQuery.data]);

  const resetJobPagination = () => {
    setJobPage(1);
    jobLoadInProgress.current = false;
  };

  useEffect(() => {
    const fetched = candQuery?.data?.candidates ?? [];
    if (Array.isArray(fetched) && fetched.length) {
      setAllCandidates((prev) => {
        const existingIds = new Set(prev.map((c) => c.applicationId));
        const newCands = fetched.filter((c) => !existingIds.has(c.applicationId));
        if (candLoadInProgress.current) candLoadInProgress.current = false;
        return [...prev, ...newCands];
      });
    } else {
      if (candLoadInProgress.current) candLoadInProgress.current = false;
    }
  }, [candQuery.data]);

  useEffect(() => {
    setCandPage(1);
    setAllCandidates([]);
    setFieldValue("applicationId", "");
    candLoadInProgress.current = false;
  }, [opportunityId]);

  const jobOptions = useMemo(() => {
    const source = allJobs.length ? allJobs : (jobsQuery?.data?.jobs ?? []);
    const items = source.map((job) => ({
      label: job.jobTitle || job.opportunityId,
      value: job.opportunityId,
    }));
    const totalPages = jobsQuery.data?.totalPages ?? 1;
    if (jobPage < totalPages) {
      items.push({ label: "Load more job offers…", value: "__load_more__" });
    }
    return items;
  }, [allJobs, jobsQuery.data, jobPage]);

  const candidateOptions = useMemo(() => {
    const source = allCandidates.length ? allCandidates : (candQuery?.data?.candidates ?? []);
    const items = source.map((it) => ({
      label: it.candidate?.fullName || it.candidate?.email || it.applicationId,
      value: it.applicationId,
    }));
    const totalPages = candQuery.data?.totalPages ?? 1;
    if (candPage < totalPages) {
      items.push({ label: "Load more candidates…", value: "__load_more__" });
    }
    return items;
  }, [allCandidates, candQuery.data, candPage]);

  // Handlers
  const onJobChange = (e) => {
    const val = e.target.value;
    if (val === "__load_more__") {
      if (jobLoadInProgress.current) return;
      jobLoadInProgress.current = true;
      setJobPage((p) => p + 1);
      return;
    }
    setFieldValue("opportunityId", val);
    setFieldValue("applicationId", "");
    setCandPage(1);
  };

  const onCandidateChange = (e) => {
    const val = e.target.value;
    if (val === "__load_more__") {
      if (candLoadInProgress.current) return;
      candLoadInProgress.current = true;
      setCandPage((p) => p + 1);
      return;
    }
    setFieldValue("applicationId", val);
  };

  return (
    <>
      <Select
        name="opportunityId"
        label="Job Offer"
        placeholder="Choose a job offer"
        value={values.opportunityId || ""}
        options={jobOptions}
        onChange={onJobChange}
        onBlur={() => {}}
        styles={styles}
        clearable
        onClear={() => {
          setFieldValue("opportunityId", "");
          setFieldValue("applicationId", "");
          resetJobPagination();
          setAllCandidates([]);
        }}
      />

      <Select
        name="applicationId"
        label="Candidate (application)"
        placeholder="Choose a candidate"
        value={values.applicationId || ""}
        options={candidateOptions}
        onChange={onCandidateChange}
        onBlur={() => {}}
        styles={styles}
        disabled={!values.opportunityId}
        clearable
        onClear={() => setFieldValue("applicationId", "")}
      />
    </>
  );
}
