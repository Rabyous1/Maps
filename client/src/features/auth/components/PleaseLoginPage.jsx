import GenericButton from '@/components/ui/inputs/Button'
import { frontUrls } from '@/utils/front-urls'
import { Typography } from '@mui/material'
import Icon401 from '@/assets/images/svg/auth/401.svg'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/config/useTheme'
import bgLight from '@/assets/images/png/401.png';
import bgDark from '@/assets/images/png/405.png';

export default function PleaseLoginPage({styles}) {
  const router = useRouter();
  const { data: theme } = useTheme();

  const bg = theme === 'dark' ? bgDark.src : bgLight.src;

  return (
    <div className={styles.container} style={{
        backgroundImage: `url(${bg})`}}>
        <Icon401 className={styles.pleaseLoginImage}/>
        <div className={styles.textContainer}>
        <Typography variant="h4" className={styles.title}>We are Sorry! </Typography>
        <Typography className={styles.subtitle}>You must login first.</Typography>
        <GenericButton onClick={() => router.push(frontUrls.login)} className={styles.returnButton}>
          Go to Login Page
        </GenericButton>
        </div>
      </div>
  )
}
