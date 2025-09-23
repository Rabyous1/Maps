"use client"
import GenericFormikForm from '@/components/form/GenericFormikForm'
import { Typography } from '@mui/material'
import React from 'react'
import { forgotPasswordValidationSchema } from '../../validations/auth.validations';
import { useForgotPassword } from '../../hooks/auth.hooks';
import { forgotPasswordFields } from './password.fields';
import GenericAlert from '@/components/ui/feedback/Alert';



export default function ForgotPassword({ styles }) {
  const { mutate: forgotpassword, isLoading } = useForgotPassword();
  const initialValues = {
    email: "",
  };

  const handleSubmit = (values, formikHelpers) => {
    const { resetForm } = formikHelpers;
    forgotpassword(values, {
      onSuccess: () => {
        resetForm();
      },
    });
  };
  return (
    <>
      <div className={styles.content} >
          <Typography variant="h4" className={styles.title}>Reset Password</Typography>
          <Typography className={styles.subtitle}>Please enter your email address to request a password reset</Typography>
          <GenericFormikForm
            styles={styles}
            initialValues={initialValues}
            validationSchema={forgotPasswordValidationSchema}
            onSubmit={handleSubmit}
            fields={forgotPasswordFields}
            submitText={"Send"}
            submitFullWidth={true}
          />
        </div>
        <GenericAlert />
    </>
  )
}
