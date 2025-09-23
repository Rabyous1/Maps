"use client";

import React from "react";

const StepperForm = ({ StepComponent, onSave, onClose, initialValues }) => {
  return (
    <StepComponent
      initialValues={initialValues}
      onSave={onSave}
      onClose={onClose}
      isEditMode={true}
      cancelFullWidth={true}
      submitFullWidth={true}
    />
  );
};

export default StepperForm;
