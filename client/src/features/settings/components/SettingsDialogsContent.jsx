'use client';

import React from 'react';
import GenericFormikForm from '@/components/form/GenericFormikForm';
import GenericAlert from '@/components/ui/feedback/Alert';
import { updatePasswordValidationSchema } from '../validations/settings.validations';
import { useConfirmTwoFactor, useGenerateTwoFactorSetup, useUpdatePassword } from '../hooks/settings.hooks';
import { qrCodeFields, updatePasswordFields } from './Settings.fields';
import Image from 'next/image';
import Spinner from '@/components/ui/feedback/Spinner';
import SendIcon from "@/assets/icons/settings/send-icon.svg";

export default function SettingsDialogsContent({ type, styles, onCancel }) {
  if (type === 'qr') {
    const { data, isLoading, isError } = useGenerateTwoFactorSetup();

    const { mutate: confirm, isLoading: confirming } = useConfirmTwoFactor(onCancel);

    const initialValues = { twoFactorCode: '' };

    const handleSubmit = (values) => {
      confirm({ token: values.twoFactorCode });
    };

    return (
      <>
        <div className={styles.qrCodeContainer}>
          {isLoading && <Spinner />}
          {isError && <p className={styles.errorText}>Failed to load QR code.</p>}
          {data?.qrCodeDataURL && (
            <Image
              src={data.qrCodeDataURL}
              alt="2FA QR Code"
              width={150}
              height={150}
              className={styles.qrImage}
            />
          )}
        </div>
        <p className={styles.qrSteps}>1. In the Google Authenticator app tap +</p>
        <p className={styles.qrSteps}>2. Select scan QR code</p>

        <GenericFormikForm
          initialValues={initialValues}
          //validationSchema={/* your Yup schema that requires twoFactorCode */}
          onSubmit={handleSubmit}
          fields={qrCodeFields}
          submitText={<SendIcon className={styles.sendIcon} />}
          isSubmitting={confirming}
          styles={styles}
          formClassName={styles.qrForm}
        />
      </>
    );
  }

  if (type === 'password') {
    const { mutate: updatePassword, isLoading } = useUpdatePassword();

    const initialValues = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };

    const handleSubmit = (values, formikHelpers) => {
      const { resetForm } = formikHelpers;

      updatePassword(values, {
        onSuccess: () => {
          resetForm();
          onCancel();
        },
      });
    };


    return (
      <>
        <GenericFormikForm
          initialValues={initialValues}
          validationSchema={updatePasswordValidationSchema}
          onSubmit={handleSubmit}
          fields={updatePasswordFields}
          submitText="Update Password"
          isSubmitting={isLoading}
          styles={styles}
          onCancel={onCancel}
          cancelText="Cancel"
        />
        <GenericAlert />
      </>
    );
  }

  return null;
}
