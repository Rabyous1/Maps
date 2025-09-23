"use client";

import React from "react";
import { useSignup } from "../../hooks/auth.hooks";
import { registerValidationSchema } from "../../validations/auth.validations";
import GenericFormikForm from "../../../../components/form/GenericFormikForm";
import { registerFields } from "./Register.fields";
import GenericAlert from "@/components/ui/feedback/Alert";

export default function RegisterForm({ styles }) {
  const { mutate: signup } = useSignup();

  const initialValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    acceptTerms: false,
  };

  const handleSubmit = (values, formikHelpers) => {
    const { resetForm } = formikHelpers;
    signup(values, {
      onSuccess: () => {
        resetForm();
      },
    });
  };

  return (
    <>
      <h4 className={styles.registertitle}>Welcome to Maps</h4>
      <GenericFormikForm
        styles={styles}                  
        initialValues={initialValues}
        validationSchema={registerValidationSchema}
        onSubmit={handleSubmit}
        fields={registerFields}
        submitText={"Create Account"}
        formClassName={styles.form}
        submitFullWidth={true}
         /><GenericAlert /></>
  );
}
