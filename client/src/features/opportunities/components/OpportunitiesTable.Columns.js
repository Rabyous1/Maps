import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from "@/assets/icons/actions/delete-icon.svg";
import ViewIcon from "@/assets/icons/auth/icon-eyeon.svg";
import CheckIcon from "@/assets/icons/actions/check-icon.svg";
import NoIcon from "@/assets/icons/actions/close-icon.svg";
import EditIcon from "@/assets/icons/actions/edit-icon.svg";
import ArchiveIcon from "@/assets/icons/actions/archive-icon.svg";
import IndustryIcon from '@/components/IndustryIcon';
import dayjs from 'dayjs';


export const getOpportunitiesColumns = (styles, onDeleteClick,onViewClick, onEditClick, onArchiveClick) => [
  {
    field: 'title',
    headerName: 'JOB',
    flex: 1,
    renderCell: (params) => {
      const title = params.value;
      const industry = params.row.industry; 
      return (
        <Box className={styles.titleContainer}>
          <IndustryIcon industry={industry} className={styles.industriesIcons} />
          <Tooltip title={title}>
            <span>{title}</span>
          </Tooltip>
        </Box>
      );
    },
  },
  {
    field: 'contractType',
    headerName: 'CONTRACT TYPE',
    flex: 0.5,
  },
  {
    field: 'visibility',
    headerName: 'VISIBILITY',
    flex: 0.5,
  },
  {
    field: 'publisheddate',
    headerName: 'PUBLISH DATE',
    renderCell: (params) => dayjs(params.value).format('YYYY-MM-DD'),
    flex: 0.5,
  },
  {
    field: 'status',
    headerName: 'Expired',
    renderCell: (params) => {
      const isActive = params.value?.toLowerCase() === 'active';
      return isActive ? (
        <CheckIcon className={styles.notExpiredIcon} />
      ) : (
        <NoIcon className={styles.expiredIcon} />
      );
    },
    flex: 0.5,
  },
  {
    field: 'applicantsNumber',
    headerName: 'APPLICANTS',
    flex: 0.5,
  },
  {
    field: 'actions',
    headerName: 'ACTIONS',
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const archived = params.row.isArchived === true;
      return(
      <div className={styles.actionsWrapper}>
        <Tooltip title="View details">
          <IconButton
            aria-label="view"
            onClick={() => onViewClick(params.row)}
          >
            <ViewIcon className={styles.viewIcon}/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit this opportunity">
          <IconButton
            aria-label="edit"
            onClick={() => onEditClick(params.row)}
          >
            <EditIcon className={styles.editIcon}/>
          </IconButton>
        </Tooltip>
        <Tooltip title={archived ? 'Unarchive this opportunity' : 'Archive this opportunity'}>
          <IconButton
            aria-label="archive"
            onClick={() => onArchiveClick(params.row)}
          >
            <ArchiveIcon className={
                archived
                  ? styles.archivedArchiveIcon
                  : styles.archiveIcon
              }/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete this opportunity">
          <IconButton
            aria-label="delete"
            onClick={() => onDeleteClick(params.row)}
          >
            <DeleteIcon className={styles.deleteIcon}/>
          </IconButton>
        </Tooltip>
      </div>
    )},
  },
];
