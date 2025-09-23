import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@/assets/icons/actions/delete-icon.svg";
import ViewIcon from "@/assets/icons/auth/icon-eyeon.svg";
import dayjs from "dayjs";
import { ResumeRenderer } from "@/components/ResumeRenderer";


export const getApplicationColumns = (styles,onViewClick, onDeleteClick) => [
  {
    field: 'title',
    headerName: 'JOB TITLE',
    flex: 0.5,
  },
  // {
  //   field: 'company',
  //   headerName: 'COMPANY',
  //   flex: 0.5,
  // },
  {
    field: 'country',
    headerName: 'COUNTRY',
    flex: 0.3,
  },
  {
    field: 'applyDate',
    headerName: 'APPLY DATE',
    flex: 0.3,
     renderCell: (params) => dayjs(params.value).format('YYYY-MM-DD'),
  },
  {
    field: 'resume',
    headerName: 'RESUME',
    flex: 0.5,
    renderCell: (params) => <ResumeRenderer filenameDisplayed={params.row.resumeDisplayName} value={params.value} styles={styles} />,
  },
 {
    field: 'resumeVideo',
    headerName: 'RESUME VIDEO',
    flex: 0.7,
    sortable: false,
    renderCell: (params) => <ResumeRenderer filenameDisplayed={params.row.resumeVideoDisplayName} value={params.value} styles={styles} />,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    flex: 0.5,
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
    field: 'actions',
    headerName: 'ACTIONS',
    flex: 0.5,
        renderCell: (params) => (
          <div className={styles.actionsWrapper}>
            <Tooltip title="View job offer">
              <IconButton
                aria-label="view"
                onClick={() => onViewClick(params.row)}
              >
                <ViewIcon className={styles.viewIcon}/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Withdraw application">
              <IconButton
                aria-label="Withdraw"
                onClick={() => onDeleteClick(params.row)}
              >
                <DeleteIcon className={styles.deleteIcon}/>
              </IconButton>
            </Tooltip>
          </div>
        ),
  }

];
