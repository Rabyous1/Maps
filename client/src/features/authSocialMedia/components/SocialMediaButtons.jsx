"use client";

import GenericButton from '@/components/ui/inputs/Button';
import { API_URLS } from "@/utils/urls";

import IconGoogle from '@/assets/icons/auth/icon-google.svg';
import IconLinkedin from '@/assets/icons/auth/icon-linkedin.svg';
import IconMicrosoft from '@/assets/icons/auth/icon-microsoft.svg';
import { useRoleRedirect } from '@/helpers/redirections';

const SocialMediaButtons = ({ styles }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  useRoleRedirect();

  const handleRedirect = (path) => {
    window.location.href = `${baseUrl}${path}`;
  };

  const socialPlatforms = [
    { name: 'Google', Icon: IconGoogle, path: API_URLS.auth.signingoogle },
    { name: 'LinkedIn', Icon: IconLinkedin, path: API_URLS.auth.signinlinkedin },
    { name: 'Microsoft', Icon: IconMicrosoft, path: API_URLS.auth.signinmicrosoft },
  ];

  return (
    <div className={styles.socialmediapart}>
      <hr className={styles.divider} />
      <div className={styles.socialbuttonscontainer}>
        {socialPlatforms.map(({ name, Icon, path }) => (
          <GenericButton
            key={name}
            variant="outlined"
            startIcon={<Icon className={styles.socialbuttonicon} />}
            onClick={() => handleRedirect(path)}
            className={styles.socialbutton}
          >
            <span className={styles.socialbuttontext}>{name}</span>
          </GenericButton>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaButtons;
