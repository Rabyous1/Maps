import { Box, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@/assets/icons/opportunities/icon-save.svg';
import IndustryIcon from '@/components/IndustryIcon';
import dayjs from 'dayjs';


export const getFavoriteOpportunitiesColumns = (styles, onUnSaveClick) => [
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
    field: 'publishAt',
    headerName: 'PUBLISH DATE',
    renderCell: (params) => dayjs(params.value).format('YYYY-MM-DD'),
    flex: 0.5,
  },
    {
    field: 'dateOfExpiration',
    headerName: 'EXPIRATION DATE',
    renderCell: (params) => dayjs(params.value).format('YYYY-MM-DD'),
    flex: 0.5,
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
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <div className={styles.actionsWrapper}>
        <Tooltip title="Unsave this opportunity.">
          <IconButton
            aria-label="unsave opportunity"
            onClick={() => onUnSaveClick(params.row)}
          >
            <SaveIcon className={styles.unsaveIcon}/>
          </IconButton>
        </Tooltip>
      </div>
    ),
  },
];
