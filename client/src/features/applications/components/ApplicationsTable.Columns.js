import { IconButton, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import IconWork from '@/assets/icons/dashboard/cards/suitcase.svg';
import IconFiles from "@/assets/icons/opportunities/icon-files.svg";


export const getJobsColumns = (styles, onViewCandidatesClick, onViewOpportunityDetailsClick) => [
  {
    field: "jobTitle",
    headerName: "JOB TITLE",
    flex: 1.5,
    renderCell: (params) => {
      const jobTitle = params.row.jobTitle;
      const country = params.row.country;
      const city = params.row.city;

      return (
        <div className={styles.jobTitleDiv}>
          <span>{jobTitle}</span>
          <span className={styles.seconInfoJobTitle}>{country}, {city}</span>
        </div>
      );
    },
  },

  {
    field: "industry",
    headerName: "INDUSTRY",
    flex: 1,

  },
  {
    field: "totalApplications",
    headerName: "APPLICATIONS",
    renderCell: (params) => (
      <span>{params.value}</span>
    ),
  },
  {
    field: "videoCvCount",
    headerName: "VIDEO CVS",
    flex: 1,
  },
  {
    field: "averageExperience",
    headerName: "AVERAGE EXPERIENCE (IN YEARS)",
    flex: 1,

  },


  {
    field: "lastApplied",
    headerName: "LAST APPLIED",
    flex: 1,
    renderCell: (params) =>
      params.value
        ? dayjs(params.value).format("DD MMM YYYY")
        : "—",
  },
  {
    field: "status",
    headerName: "JOB STATUS",
    flex: 1.25,
    renderCell: (params) => {
      const status = params.value.toLowerCase();
      return (
        <div className={`${styles.statusPill} ${styles[status]}`}>
          <span className={styles.dot} />
          {params.value}
        </div>

      );
    },
  },
  {
    field: "actions",
    headerName: "ACTIONS",
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => {
      return (
        <>
          <Tooltip title="View Candidates List">
            <IconButton onClick={() => onViewCandidatesClick(row)}>
              <IconFiles className={styles.viewCanidatesListIcon} />
            </IconButton>
          </Tooltip>

          <Tooltip title="View Opportunity Details">
            <IconButton onClick={() => onViewOpportunityDetailsClick(row)}>
              <IconWork className={styles.viewOpportunityDetailsIcon} />
            </IconButton>
          </Tooltip>
        </>
      );
    },
  }
]