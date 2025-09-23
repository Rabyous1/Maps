"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";

import AccountCard from "./AccountCard";
import InfoItem from "./InfoItem";
import { getAccount } from "../../services/account.services";
import { useCurrentUser } from "@/features/user/hooks/users.hooks";
import { editSectionFields } from "./editSectionFields";
import {
  certificationsDialog,
  educationDialog,
  languageDialog,
  namePicDialog,
  personalInfoDialog,
  resumeDialog,
  skillsDialog,
  summaryDialog,
  workExperienceDialog,
} from "./sectionsDialogs/AddSectionsDialogs";

const dialogMap = {
  namePicSection: namePicDialog,
  personalInfo: personalInfoDialog,
  professionalSummary: summaryDialog,
  skills: skillsDialog,
  language: languageDialog,
  certification: certificationsDialog,
  workExperience: workExperienceDialog,
  resume: resumeDialog,
  education: educationDialog,
};

export default function SectionList({ sections, cardClass, styles }) {
  const { data: accountData } = useQuery("account", getAccount);
  const { data: currentUser } = useCurrentUser();
  const [editingSection, setEditingSection] = useState(null);

  const handleEdit = (section) => setEditingSection(section);
  const handleClose = () => setEditingSection(null);

  const dialogElement = useMemo(() => {
    
    if (!editingSection || !accountData) return null;

    const DialogComponent = dialogMap[editingSection.key];
    if (!DialogComponent) return null;

    const fields = editSectionFields[editingSection.key] || [];
    const initialValues = fields.reduce((acc, field) => {
      acc[field.name] = accountData[field.name] ?? (field.type === "array" ? [] : "");
      return acc;
    }, {});
    const isEditMode = editingSection.key === "skills";
    if (editingSection.key === "namePicSection") {
    console.log("Opening NamePicDialog with initial values:", initialValues);
  }console.log("Account Data:", accountData);

    return (
      <DialogComponent
        key={editingSection.key}
        open={true}
        onClose={handleClose}
        initialValues={initialValues}
        isEditMode={isEditMode}
      />
    );
  }, [editingSection, accountData]);

  return (
    <>
      {sections.map((section) => {
        const isEmpty = section.fields.every((field) => {
          const val = accountData?.[field.name || field.key];
          return field.EmptyComponent
            ? Array.isArray(val)
              ? val.length === 0
              : !val
            : val == null || val === "";
        });

        const cardClassName =
          section.key === "namePicSection"
            ? styles.namePicSectionCard
            : `${styles.card} ${cardClass || ""}`;

        return (
          <AccountCard
            key={section.key}
            title={section.title}
            className={cardClassName}
            styles={styles}
            onEdit={() => handleEdit(section)}
            hideEdit={isEmpty}
          >
            <div className={styles[section.key]}>
              {section.fields.map((field, idx) => (
                <InfoItem
                  key={idx}
                  label={field.label}
                  value={accountData?.[field.name || field.key]}
                  IconComponent={field.icon}
                  styles={styles}
                  fieldKey={field.key}
                  className={styles[field.className] || styles.value}
                  primaryFields={section.primaryFields || []}
                  secondaryFields={section.secondaryFields || []}
                  showHrAfter={["education", "certification", "workExperience"]}
                  sectionKey={section.key}
                  currentUser={currentUser}
                  EmptyComponent={field.EmptyComponent}
                />
              ))}
            </div>
          </AccountCard>
        );
      })}
      {dialogElement}
    </>
  );
}
