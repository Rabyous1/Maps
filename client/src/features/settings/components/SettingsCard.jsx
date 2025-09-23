'use client';
import GenericButton from '@/components/ui/inputs/Button';
import GenericCard from '@/components/ui/surfaces/Card';

export default function SettingsCard({
  title,
  description,
  button,
  onClick,
  SvgIcon,
  styles,
  isActionButton = false,
  buttonClassName,
}) {
  return (
    <GenericCard
      styles={styles}>
        <div className={styles.contentLeft}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
          <GenericButton
          onClick={onClick}
          variant={isActionButton ? 'outlined' : 'contained'}
          className={buttonClassName}
        >
          {button}
        </GenericButton>
        </div>
        {SvgIcon && <SvgIcon className={styles.icon} />}
    </GenericCard>
  );
}
