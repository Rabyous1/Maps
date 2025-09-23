"use client"
import React from 'react'
import { useResetPassword } from '../../hooks/auth.hooks';
import { resetPasswordFields } from './password.fields';
import { Typography } from '@mui/material';
import GenericFormikForm from '@/components/form/GenericFormikForm';
import { resetPasswordValidationSchema } from '../../validations/auth.validations';
import GenericAlert from '@/components/ui/feedback/Alert';
import { useRouter, useSearchParams } from 'next/navigation'
import { frontUrls } from '@/utils/front-urls';

export default function ResetPassword({ styles }) {
   const { mutate: resetpassword, isLoading } = useResetPassword();
    const searchParams = useSearchParams();
     const router = useRouter();
 
  const resetToken = searchParams.get('token')

    const initialValues = {
        password: "",
        confirmNewPassword: "",
    };
    const handleSubmit = (values, formikHelpers) => {
  const { resetForm } = formikHelpers;

  const payload = {
    ...values,
    resetToken: resetToken,
  };

  resetpassword(payload, {
    onSuccess: () => {
      resetForm();
      router.push(frontUrls.dashboard);
    },
  });
};

    if (!resetToken) {
    console.error("Reset token is missing from URL");
    return <div>Invalid or missing token</div>;
  }
  return (
    <>
      <div className={styles.content}>
        <Typography variant="h4" className={styles.title}>Reset Password</Typography>
        <Typography className={styles.subtitle}>Please enter your email address to request a password reset</Typography>
        <GenericFormikForm
          styles={styles}                  
          initialValues={initialValues}
          validationSchema={resetPasswordValidationSchema}
          onSubmit={handleSubmit}
          fields={resetPasswordFields}
          submitText={"Reset password"}
          submitFullWidth={true}
        />
         </div>

       <GenericAlert />
      </>
  )
}
