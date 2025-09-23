import React from "react";
import AddIcon from "@/assets/icons/actions/add-icon.svg";
import UploadIcon from "@/assets/icons/actions/upload-icon.svg";
import EmptyIcon from "@/assets/images/svg/emptyAvatar.svg";
import EmptyState from "./EmptyBlock";

import {
  certificationsDialog,
  educationDialog,
  languageDialog,
  resumeDialog,
  skillsDialog,
  workExperienceDialog,
  summaryDialog,
  personalInfoDialog,
  namePicDialog,
} from "./sectionsDialogs/AddSectionsDialogs";

export const NamePicEmpty = (props) => (
  <EmptyState
    {...props}
    icon={AddIcon}
    iconClass="emptyIcon"
    title="Add info"
    titleClass="emptyText"
    DialogComponent={namePicDialog}
  />
);

export const PersonalInfoEmpty = (props) => (
  <EmptyState
    {...props}
    icon={AddIcon}
    iconClass="emptyIcon"
    title="Add contact info"
    titleClass="emptyText"
    DialogComponent={personalInfoDialog}
  />
);

export const SkillsEmpty = (props) => (
  <EmptyState
    {...props}
    icon={AddIcon}
    iconClass="emptyIcon"
    title="Add Skills"
    titleClass="emptyText"
    DialogComponent={skillsDialog}
  />
);

export const SummaryEmpty = (props) => (
  <EmptyState
    {...props}
    icon={AddIcon}
    iconClass="emptyIcon"
    title="Add Summary"
    titleClass="emptyText"
    DialogComponent={summaryDialog}
  />
);

export const WorkExperienceEmpty = (props) => (
  <EmptyState
    {...props}
    icon={EmptyIcon}
    iconClass="emptyAvatar"
    title="No Work Experience Yet"
    subtitle="Add your first role to get started!"
    titleClass="emptyTitle"
    subtitleClass="emptySubTitle"
    buttonText="Add Work Experience"
    buttonClass="addEmptyButton"
    DialogComponent={workExperienceDialog}
  />
);

export const ResumeEmpty = (props) => (
  <EmptyState
    {...props}
    icon={UploadIcon}
    iconClass="emptyIcon"
    title="Upload Your Resume"
    titleClass="emptyText"
    // buttonText="Upload"
    buttonClass="addEmptyButton"
    DialogComponent={resumeDialog}
  />
);

export const EducationEmpty = (props) => (
  <EmptyState
    {...props}
    icon={EmptyIcon}
    iconClass="emptyAvatar"
    title="No Education Added Yet"
    subtitle="Add your education to complete your profile!"
    titleClass="emptyTitle"
    subtitleClass="emptySubTitle"
    buttonText="Add Education"
    buttonClass="addEmptyButton"
    DialogComponent={educationDialog}
  />
);

export const CertificationEmpty = (props) => (
  <EmptyState
    {...props}
    icon={EmptyIcon}
    iconClass="emptyAvatar"
    title="No Certifications Added Yet"
    subtitle="Add your certifications to complete your profile!"
    titleClass="emptyTitle"
    subtitleClass="emptySubTitle"
    buttonText="Add Certification"
    buttonClass="addEmptyButton"
    DialogComponent={certificationsDialog}
  />
);

export const LanguageEmpty = (props) => (
  <EmptyState
    {...props}
    icon={AddIcon}
    iconClass="emptyIcon"
    title="Add language"
    titleClass="emptyText"
    DialogComponent={languageDialog}
  />
);