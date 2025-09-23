"use client";

import React, { useState } from "react";
import { Box, Stepper, Step, StepLabel, Button, Typography } from "@mui/material";
import { useUpdateAccount, useCompleteAccount } from "@/features/account/hooks/account.hooks";
import { getStepperSteps } from "./stepper.config";
import StepperForm from "./StepperForm";
import { useCurrentUser } from '@/features/user/hooks/users.hooks';
import { useAppRouter, useRoleRedirect } from "@/helpers/redirections";
import GenericCard from "@/components/ui/surfaces/Card";

export default function AccountStepperPage({ styles }) {
  const { pushDashboard } = useAppRouter();
  const { data: user } = useCurrentUser();
  const completeAccount = useCompleteAccount();
  const role = user?.roles;
  console.log("Current user role:", role);
  const steps = getStepperSteps(role, styles);
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [isFinishing, setIsFinishing] = useState(false);

  const updateAccount = useUpdateAccount();
  useRoleRedirect();

  const candidateStepKeys = ["summary", "skills", "languages", "professionalExperience", "education", "certification"];
  const recruiterStepKeys = ["companyName", "companyWebsite", "companySize", "recruiterSummary", "position", "department", "legalStatus", "fiscalNumber"]; // ou autre logique adaptée

  const stepKeys = role === "Candidat" ? candidateStepKeys : recruiterStepKeys;


  const currentKey = stepKeys[activeStep];
  const stepInitialValues = formValues[currentKey]
    ? { [currentKey]: formValues[currentKey] }
    : undefined;

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleSaveStep = async (values) => {
    console.log("Current step values:", values);
    const firstKey = Object.keys(values)[0];
    let updatedValues = {};

    if (firstKey.includes(".")) {
      const [prefix] = firstKey.split(".");
      updatedValues[prefix] = {
        ...(formValues[prefix] || {}),
        ...Object.fromEntries(
          Object.entries(values).map(([key, val]) => [key.split(".")[1], val])
        ),
      };
    } else {
      updatedValues = { ...values };
    }

    const mergedValues = {
      ...formValues,
      ...updatedValues,
    };

    setFormValues(mergedValues);

    try {
      await updateAccount.mutateAsync({ values: mergedValues });

      if (isFinishing) {
        const flatValues = Object.values(mergedValues).reduce(
          (acc, item) => ({ ...acc, ...item }),
          {}
        );
        await updateAccount.mutateAsync({ values: flatValues }); 
        pushDashboard();
        alert("All data saved!");
      } else {
        handleNext();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    } finally {
      setIsFinishing(false);
    }
  };


  const handleFinish = async () => {
    setIsFinishing(true); document
      .querySelector("form")
      ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    try {
      const flatValues = Object.values(formValues).reduce((acc, item) => ({ ...acc, ...item }), {});
      await updateAccount.mutateAsync({ values: flatValues });
      await completeAccount.mutateAsync({ values: { isCompleted: true } });
      pushDashboard();
      // alert("All data saved!");
    } catch (error) {
      console.error("Erreur lors de la finalisation :", error);
    }
  };

  const StepComponent = steps[activeStep].component;

  return (
    <div className={styles.completeProfileContent}>
      <Typography variant="h4" className={styles.title}>
        Complete your profile
      </Typography>
<GenericCard styles={styles} className={styles.completeProfileCard}>
      <Stepper activeStep={activeStep} alternativeLabel  className={styles.stepper}>
  {steps.map((step, index) => {
    const isActive = activeStep === index;
    const isCompleted = activeStep > index;

    return (
      <Step key={index}>
        <StepLabel
          StepIconProps={{
            classes: {
              root: styles.stepLabelRoot,
              active: styles.stepLabelActive,
              completed: styles.stepLabelCompleted,
            },
          }}
          classes={{
    label: styles.stepLabelText, 
  }}
          className={
            isActive
              ? styles.stepLabelActive
              : isCompleted
              ? styles.stepLabelCompleted
              : styles.stepLabelRoot
          }
        >
          {step.label}
        </StepLabel>
      </Step>
    );
  })}
</Stepper>

<div className={styles.formContainer}>
      <StepperForm
        StepComponent={StepComponent}
        initialValues={stepInitialValues}
        onSave={handleSaveStep}
        onClose={() => { }}
      />

      <Box className={styles.stepperButtons}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </button>

        {activeStep === steps.length - 1 ? (
          <button
            type="button"
            className={styles.finishButton}
            onClick={handleFinish}
          >
            Finish
          </button>
        ) : (
          <button
            type="button"
            className={styles.nextButton}
            onClick={() =>
              document
                .querySelector("form")
                ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
            }
          >
            Next
          </button>
        )}
      </Box>
</div>
</GenericCard>
    </div>
  );
}
