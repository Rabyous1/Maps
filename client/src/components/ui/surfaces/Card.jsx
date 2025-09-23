'use client';
import { Card, CardContent} from '@mui/material';

export default function GenericCard({ title, children, footer, styles, className }) {
  return (
    <Card className={`${styles.card} ${className || ''}`} elevation={3}>
      <CardContent
      className={styles.cardContent} sx={{padding: '0 !important',}}>
        {title && <div className={styles.title}>{title}</div>}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </CardContent>
    </Card>
  );
}
