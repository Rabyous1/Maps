import { IconButton, Tooltip } from "@mui/material";
import IconLinkedin from '@/assets/icons/auth/icon-linkedin.svg';
import IconChat from '@/assets/icons/dashboard/icon-chat.svg';
import IconCalendar from '@/assets/icons/opportunities/icon-calendar.svg';
import InterestedToggle from "./InterestedToggle";
import { ResumeRenderer } from "@/components/ResumeRenderer";



export const getCandidatesColumns = (styles, onInterestChange, onView, onMessage, onSchedule) => [
  {
    field: 'fullName',
    headerName: 'NAME',
    flex: 1.3,
    renderCell: (params) => {
      const fullName = params.row.fullName;
      const email = params.row.email;

      return (
        <div className={styles.nameWrapper}>
          <span>{fullName}</span>
          <span className={styles.email}>{email}</span>
        </div>
      );
    },
  },
  {
    field: 'phone',
    headerName: 'PHONE NUMBER',
    flex: 1,
  },
  {
    field: 'cvUrl',
    headerName: 'RESUME',
    flex: 1.2,
    sortable: false,

    renderCell: (params) => <ResumeRenderer filenameDisplayed={params.row.resumeDisplayName} value={params.value} styles={styles} />,
  },
  {
    field: 'cvVideoUrl',
    headerName: 'RESUME VIDEO',
    flex: 1.2,
    sortable: false,
    renderCell: (params) => <ResumeRenderer filenameDisplayed={params.row.resumeVideoDisplayName} value={params.value} styles={styles} />,
  },
  {
    field: 'stauts',
    headerName: 'STATUS',
    flex: 1.25,
    renderCell: ({ row }) => {
      const status = row.applicationStatus?.toLowerCase();

      return (
        <div className={`${styles.statusPill} ${styles[status]}`}>
          <span className={styles.dot} />
          {row.applicationStatus}
        </div>
      );
    }
  },
  {
    field: 'interestedStatus',
    headerName: 'Interested ?',
    flex: 1.7,
    sortable: false,

    renderCell: ({ row }) => (
      <InterestedToggle
        styles={styles}
        value={row.interest}
        onChange={(newValue) => onInterestChange(row.applicationId, newValue)}
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'ACTIONS',
    flex: 1,
    sortable: false,
    renderCell: ({ row }) => {
      const hasLinkedIn = Boolean(row.linkedinLink);
      return (
        <div className={styles.actions}>
          <Tooltip title={hasLinkedIn ? "View LinkedIn Account" : "No LinkedIn account available."}>
            <IconButton
              disabled={!hasLinkedIn}
              onClick={() => hasLinkedIn && onView(row.linkedinLink)}
            >
              <IconLinkedin className={styles.linkedInIcon} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Send message">
            <IconButton onClick={() => onMessage(row.id)}>
              <IconChat className={styles.chatIcon} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Schedule Interview">
            <IconButton onClick={() => onSchedule(row.id)}>
              <IconCalendar className={styles.calendarIcon} />
            </IconButton>
          </Tooltip>
        </div>
      );
    },
  },
];