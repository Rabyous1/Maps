"use client";

import React from "react";
import { useLogin } from "../../hooks/auth.hooks";
import { signInValidationSchema } from "../../validations/auth.validations";
import GenericFormikForm from "../../../../components/form/GenericFormikForm";
import { loginFields } from "./login.fields";
import { useRouter } from "next/navigation";
import { useTwoFA } from "@/context/TwoFAContext";

export default function LoginForm({ styles }) {
  const router = useRouter();
  const { mutate: login } = useLogin();
  const { setIs2FAPending } = useTwoFA();

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = (values, formikHelpers) => {
    const { resetForm } = formikHelpers;

    login(values, {
      onSuccess: (data) => {
        console.log("✅ Login success data:", data);
        resetForm();

        const { user, twoFactorRequired } = data;

       
        if (twoFactorRequired) {
          setIs2FAPending(true); 
          router.push(`/2FA?userId=${user.id}`);
          return;
        }
 else {

          const isAdmin = user.roles === "Admin" || user.roles?.includes("Admin");
          console.log("👤 Role detected:", user.roles, "→ isAdmin:", isAdmin);

          if (isAdmin) {
            router.push("/users");
          } else {
            router.push("/dashboard/home");
          }
        }
      },
      onError: (error) => {
        console.error("❌ Login error:", error);
      },
    });
  };

  return (
    <div className={styles.formcontainer}>
      <h4 className={styles.logintitle}>Welcome back</h4>
      <GenericFormikForm
        styles={styles}
        initialValues={initialValues}
        validationSchema={signInValidationSchema}
        onSubmit={handleSubmit}
        fields={loginFields}
        submitText={"Sign In"}
        submitFullWidth={true}
      />
    </div>
  );
}