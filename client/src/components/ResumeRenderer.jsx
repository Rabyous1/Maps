// import { useGetFile } from "@/features/files/files.hooks";
import FileIcon from "@/assets/icons/account/icon-file.svg";
import { useGetFile } from "@/features/files/hooks/files.hooks";
import { Tooltip, Typography } from "@mui/material";


export function ResumeRenderer({ filenameDisplayed, value, styles }) {
  const filename = value?.split('/').pop();
  if (!filename) {
    return <span>—</span>;
  }
  console.log(filenameDisplayed);
  const { data: fileUrl } = useGetFile(filename);

  const handleOpen = () => {
    if (fileUrl) window.open(fileUrl, '_blank');
  };

  return (
    <div
      className={styles.cvItem}
      style={{ cursor: fileUrl ? 'pointer' : 'default' }}

      onClick={fileUrl ? handleOpen : undefined}
    >
      <FileIcon className={styles.resumeIcon} aria-label="View resume" />
      <Tooltip title="Open resume document">
      <Typography variant="body2" noWrap>
        {filenameDisplayed ?? filename ?? '—'}
      </Typography>
      </Tooltip>
    </div>
  );
}