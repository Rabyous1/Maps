import React from "react";
import {
  SkillsForm,
  LanguageForm,
  ProfessionalExperienceForm,
  EducationForm,
  CertificationForm,
  SummaryForm,
} from "../candidateAccount/sectionsDialogs/contents";
import {
  RecruiterBasicInfoForm,
  RecruiterCompanyInfoForm,
  RecruiterLegalInfoForm,
} from "../recruiterAccount/RecruiterInfoForm";

export const getStepperSteps = (role, styles) => {
  const candidateSteps = [
    { label: "Summary", component: (props) => <SummaryForm {...props} styles={styles}hideButtons  /> },
    { label: "Skills", component: (props) => <SkillsForm {...props} styles={styles}hideButtons  /> },
    { label: "Languages", component: (props) => <LanguageForm {...props} styles={styles} hideButtons  /> },
    { label: "Experience", component: (props) => <ProfessionalExperienceForm {...props} styles={styles} hideButtons  /> },
    { label: "Education", component: (props) => <EducationForm {...props} styles={styles} hideButtons /> },
    { label: "Certifications", component: (props) => <CertificationForm {...props} styles={styles} hideButtons  /> },
  ];

  const recruiterSteps = [
    { label: "CompanyInfo", component: (props) => <RecruiterCompanyInfoForm {...props} styles={styles}hideButtons  /> },
    { label: "BasicInfo", component: (props) => <RecruiterBasicInfoForm {...props} styles={styles} hideButtons /> },
    { label: "LegalInfo", component: (props) => <RecruiterLegalInfoForm {...props} styles={styles}hideButtons  /> },
  ];

  return role === "Candidat" ? candidateSteps : recruiterSteps;
};
