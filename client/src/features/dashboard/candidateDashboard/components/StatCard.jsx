'use client';
import { Box, Typography } from '@mui/material';
import GenericCard from '@/components/ui/surfaces/Card';


export default function StatCard({ Icon, label, value, change, trend, styles }) {
  const title = (
    <Box className={styles.iconLabel}>
      <div className={styles.iconWrapper}>
      <Icon className={styles.icon} /> 
      </div>
      <Typography variant="body2" className={styles.label}>{label}</Typography>
    </Box>
  );

  const content = (
    <Box className={styles.valueChange}>
      <Typography className={styles.value}>{value}</Typography>
      <Box className={`${styles.changeContainerPositive} ${parseFloat(change) < 0 ? styles.changeContainerNegative : ''}`}>
        <Typography className={styles.change}>{change}</Typography>
        <Typography className={styles.trend}>{trend}</Typography>
      </Box>
    </Box>
  );

  return (
    <GenericCard styles={styles} title={title}>
      {content}
    </GenericCard>
  );
}
