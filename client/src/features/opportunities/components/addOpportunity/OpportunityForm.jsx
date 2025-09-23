"use client";

import React, { useState, useEffect } from "react";
import GenericFormikForm from "@/components/form/GenericFormikForm";
import GenericCard from "@/components/ui/surfaces/Card";
import { opportunityAddFields } from "./AddOpportunity.columns";
import { useCreateOpportunity } from "../../hooks/opportunities.hooks";
import { loadCities } from "@/utils/functions";
import { addOppValidationSchema } from "../../validations/opportunities.validations";

const initialValues = opportunityAddFields.reduce(
  (acc, { name, type }) => ({
    ...acc,
    [name]: type === "checkbox" ? false : "",
  }),
  {}
);

export default function OpportunityForm({ styles }) {
  const { mutate: createOpportunity, isLoading } = useCreateOpportunity();
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    loadCities().then(setCities).catch(console.error);
  }, []);

  const handleCountryChange = (e, setFieldValue) => {
    const country = e.target.value;
    setFieldValue("country", country);
    setFieldValue("city", "");
    setSelectedCountry(country);
  };

  const fields = opportunityAddFields.map(field => {
    if (field.name === "isPublished") {
    return {
      ...field,
      onChange: (e, setFieldValue) => setFieldValue("isPublished", e.target.checked)
    };
  }
    if (field.name === "country")
      return { ...field, onChange: handleCountryChange };

    if (field.name === "city") {
      const options = selectedCountry
        ? cities
          .filter(c => c.country === selectedCountry)
          .map(c => ({ label: c.city, value: c.city }))
        : [];
      return {
        ...field,
        options,
        disabled: !selectedCountry,
        placeholder: selectedCountry
          ? "Select a city"
          : "Choose country first",
      };
    }

    return field;
  });
  const handleSubmit = (values, formikHelpers) => {
    const { resetForm } = formikHelpers;

const isPublishedValue = values.publishAt ? false : values.isPublished;
const publishAtValue = values.isPublished ? undefined : values.publishAt || undefined;


 const visibilityValue = values.visibility ? "Draft" : "Public";
  console.log("publishAtValue", publishAtValue);
  console.log("visibilityValue", visibilityValue);
  console.log("isPublished checkbox", values.isPublished);
  console.log("visibility checkbox", values.visibility);
    createOpportunity(
      {
        ...values,
        isPublished: isPublishedValue,
        city: { name: values.city },
        publishAt: publishAtValue,
        OpportunityVersions: [
          {
            title: values.title,
            visibility: visibilityValue,
            jobDescription: values.jobDescription,
          },
        ],
      },
      {
        onSuccess: () => {
          resetForm();
        },
      }
    );
  };
  return (
    <GenericCard styles={styles} className={styles.addOpportunityCard}>
      <div className={styles.formAddOppWrapper}>
        <GenericFormikForm
          initialValues={initialValues}
          validationSchema={addOppValidationSchema}
          onSubmit={handleSubmit}
          fields={fields}
          submitText={isLoading ? "Submitting..." : "Submit Opportunity"}
          formClassName={styles.formAddOpp}
          onCancel={() => console.log("canceled")}
          cancelText="Clear Form"
          styles={styles}
        />
      </div>
    </GenericCard>
  );
}
