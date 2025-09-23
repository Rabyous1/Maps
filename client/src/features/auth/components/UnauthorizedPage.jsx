import GenericButton from '@/components/ui/inputs/Button'
import { frontUrls } from '@/utils/front-urls'
import { Typography } from '@mui/material'
import Icon403 from '@/assets/images/svg/auth/403.svg'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/config/useTheme'
import bgLight from '@/assets/images/png/401.png';
import bgDark from '@/assets/images/png/405.png';

export default function UnauthorizedPage({styles}) {
  const router = useRouter();
    const { data: theme } = useTheme();
  
    const bg = theme === 'dark' ? bgDark.src : bgLight.src;

  return (
    <div className={styles.container}  style={{
        backgroundImage: `url(${bg})`}}>
        <Icon403 className={styles.unauthorizedImage}/>
        <div className={styles.textContainer}>
        <Typography variant="h4" className={styles.title}>We are Sorry !</Typography>
        <Typography className={styles.subtitle}>You are forbidden from going to this page, please try again later or contact the admin.</Typography>
        <GenericButton onClick={() => router.push(frontUrls.login)} className={styles.returnButton}>
          Go to Login Page
        </GenericButton>
        </div>
      </div>
  )
}
