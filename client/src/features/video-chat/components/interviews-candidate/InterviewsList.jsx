"use client";

import React, { useState, useMemo } from "react";
import GenericCard from "@/components/ui/surfaces/Card";
import Table from "@/components/ui/inputs/GenericTable";
import { useListInterviewsCandidate } from "../../hooks/videoChat.hooks";
import dayjs from "dayjs";
import ProfilePicture from "@/features/messages/components/ProfilePicture";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

export default function InterviewsList({ styles }) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useListInterviewsCandidate({
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

const columns = useMemo(
  () => [
    {
      field: "dateColumn",
      headerName: "Date",
      flex: 1.7,
renderCell: (params) => dayjs(params.row.date).format("dddd, Do MMMM YYYY")

    },
    {
      field: "timeColumn",
      headerName: "Time",
      flex: 0.5,
      renderCell: (params) => dayjs(params.row.date).format("HH:mm"),
    },
        {
      field: "recruiterCompany",
      headerName: "Company",
      flex: 1.6,
      renderCell: (params) => params.row.recruiter?.companyName || "-",
    },
    {
      field: "recruiter",
      headerName: "Recruiter",
      flex: 1,
      renderCell: (params) => {
        const candidate = params.row.recruiter;
        if (!candidate) return "-";

        return (
          <div >
            <ProfilePicture
              filename={candidate.profilePicture?.split("/").pop()}
              fullName={candidate.fullName}
              styles={styles}
              isOnline={false}
              hasBorder
              forceGray={true}
            />
            <span>{candidate.fullName}</span>
          </div>
        );
      },
    },

    {
      field: "opportunity",
      headerName: "Opportunity",
      flex: 1.5,
      renderCell: (params) => params.row.opportunityTitle || "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => params.row.status || "-",
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      renderCell: (params) => params.row.notes || "-",
    },
  ],
  []
);

  const rows = data?.interviews || [];

  return (
    <div>
      <h2 className={styles.interviewsTitle}>Your Interviews List</h2>

      <GenericCard styles={styles} className={styles.interviewsCard}>
        <Table
          columns={columns}
          data={rows}
          paginationModel={{
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
          }}
          totalRows={data?.totalInterviews || 0}
          onPaginationChange={setPaginationModel}
          styles={styles}
          isLoading={isLoading}
          noDataMessage="No interviews found"
        />
      </GenericCard>
    </div>
  );
}
