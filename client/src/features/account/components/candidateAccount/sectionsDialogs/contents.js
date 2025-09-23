import React, { useState } from "react";
import GenericFormikForm from "@/components/form/GenericFormikForm";
import CloseIcon from "@mui/icons-material/Close";
import {Button, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  ContractTypes,
  countryCodeMap,
  LanguageLevels,
  LanguageOptions,
} from "@/utils/constants";
import {
  certificationSchema,
  educationSchema,
  languageSchema,
  professionalExperienceSchema,
  skillsSchema,
  summarySchema,
  personalInfoSchema,
  namePicSchema
} from "@/features/account/validations/account.validations";
import GenericButton from "@/components/ui/inputs/Button";

export const generateFormikFormComponent = (
  defaultValues,
  fields,
  validationSchema = null
) => {
  return function FormikFormComponent({
    initialValues: overrideValues,
    onSave,
    onClose,
    styles,
    hideButtons = false,
  }) {
    const formInitialValues = overrideValues ?? defaultValues;

    const formProps = {
      initialValues: formInitialValues,
      validationSchema,
      onSubmit: (values) => {
        onSave?.(values);
        onClose?.();
      },
      fields,
      styles,
      onCancel: onClose,
    };

    if (!hideButtons) {
      formProps.submitText = "Save";
      formProps.cancelText = "Cancel";
    }

    return <GenericFormikForm {...formProps} styles={styles} />;
  };
};



export const NamePicForm = generateFormikFormComponent(
  {
    fullName: "",
    targetRole: "",
    linkedinLink: "",
  },
  [
    { name: "fullName", label: "Fullname", type: "text", placeholder: "Your fullname", required: true },
    { name: "targetRole", label: "Current Position", type: "text", placeholder: "e.g. Marketing Specialist", required: true },
    { name: "linkedinLink", label: "Linkedin Link", type: "text", placeholder: "Your Linkedin link", required: false },
  ],
  namePicSchema
);
export const PersonalInfoForm = generateFormikFormComponent(
  {
    email: "",
    dateOfBirth: "",
    phone: "",
    country: "",
  },
  [
    { name: "email", label: "Email", type: "email", placeholder: "Your email", required: true },
    { name: "dateOfBirth", label: "Date Of Birth", type: "date", placeholder: "Your date of birth", required: false },
    { name: "phone", label: "Phone", type: "tel", placeholder: "Your phone number", required: true },
    { name: "country", label: "Country", type: "select", options: Object.entries(countryCodeMap).map(([key, value]) => ({ value, label: value })) },
  ],
  personalInfoSchema
);

export const SummaryForm = generateFormikFormComponent(
  { summary: "" },
  [{ name: "summary", placeholder: "Add bio", type: "text", multiline: true, rows: 4 }],
  summarySchema
);

const SkillsFormInner = generateFormikFormComponent(
  { skills: [""] },
  [{ name: "skills", type: "array", itemType: "text", placeholder: "e.g. Project Management" }],
  skillsSchema
);




export function SkillsForm(props) {
  const {
    isEditMode,
    initialValues,
    onSave,
    onClose: onCancel,
    styles,
    cancelText = "Cancel",
    submitText = "Save",
    cancelFullWidth = false,
    submitFullWidth = false,
  } = props;

  const [skills, setSkills] = useState(initialValues?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const [errorMessage, setErrorMessage] = useState("");

const handleSave = async () => {
  setIsSubmitting(true);
  setErrorMessage("");

  try {
    await skillsSchema.validate({ skills }, { abortEarly: false });
    await onSave?.({ skills });
    onCancel?.();
  } catch (validationError) {
    if (validationError?.errors?.length) {
      setErrorMessage(validationError.errors[0]);
    }
  }

  setIsSubmitting(false);
};



  if (isEditMode) {
    return (
      <>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <TextField
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g JavaScript, Project Management, etc ..."
            variant="outlined"
            fullWidth
            size="small"
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              if (newSkill.trim()) {
                setSkills([...skills, newSkill.trim()]);
                setNewSkill("");
              }
            }}
            className={styles.addSkillButton}
          >
            Add
          </Button>
        </div>

        {skills.length === 0 ? (
          <p className={styles.emptySkillsText}>Your skills list is now empty.</p>
        ) : (
          <div className={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <span key={index} className={styles.skills}>
                {skill}
                <IconButton onClick={() => handleRemoveSkill(index)} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </span>
            ))}
          </div>
        )}

        <div className={styles.actionButtons}>
          
          <GenericButton
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            fullWidth={submitFullWidth}
            className={styles.submitbutton}
          >
            {submitText}
          </GenericButton>
        </div>
      </>
    );
  }

  return <SkillsFormInner {...props} />;
}

export const LanguageForm = generateFormikFormComponent(
  { languages: [{ name: "", level: "" }] },
  [
    {
      name: "languages",
      label: "Languages",
      type: "array",
      itemFields: [
        {
          key: "name",
          label: "Language",
          type: "select",
          placeholder: "Choose your language",
          dynamicOptions: (values, index) => {
            // Récupère toutes les langues déjà choisies sauf celle de la ligne en cours
            const chosenLanguages = values.languages
              .map((lang) => lang.name)
              .filter((_, i) => i !== index);

            return LanguageOptions
              .filter((lang) => !chosenLanguages.includes(lang))
              .map((lang) => ({ value: lang, label: lang }));
          },
          required: true,
        },
        {
          key: "level",
          label: "Proficiency Level",
          type: "select",
          placeholder: "Choose your language level",
          options: Object.entries(LanguageLevels).map(([key, value]) => ({
            value: value,
            label: value,
          })),
          required: true,
        },
      ],
    },
  ],
  languageSchema,
);


export const EducationForm = generateFormikFormComponent(
  { education: [{ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }] },
  [
    {
      name: "education",
      label: "Education",
      type: "array",
      itemFields: [
        { key: "institution", label: "Institution", type: "text", placeholder: "e.g. Stanford University", required: true },
        { key: "degree", label: "Degree", type: "text", placeholder: "e.g. PhD", required: true },
        { key: "fieldOfStudy", label: "Field of Study", type: "text", placeholder: "e.g. Computer Science", required: true },
        { key: "startDate", label: "Start Date", type: "date", placeholder: "YYYY-MM-DD", required: true },
        { key: "endDate", label: "End Date", type: "date", placeholder: "YYYY-MM-DD (or expected)", required: true },
      ],
    },
  ],
  educationSchema
);

export const CertificationForm = generateFormikFormComponent(
  { certification: [{ academy: "", title: "", startDate: "", endDate: "" }] },
  [
    {
      name: "certification",
      label: "Certifications",
      type: "array",
      itemFields: [
        { key: "academy", label: "Issuer", placeholder: "e.g. Amazon Web Services", type: "text", required: true },
        { key: "title", label: "Certification Title", placeholder: "e.g. AWS Certified Developer", type: "text", required: true },
        { key: "startDate", label: "Issue Date", placeholder: "YYYY-MM-DD", type: "date", required: true },
        { key: "endDate", label: "Expiration Date", placeholder: "YYYY-MM-DD", type: "date", required: true },
      ],
    },
  ],
  certificationSchema
);

export const ProfessionalExperienceForm = generateFormikFormComponent(
  { professionalExperience: [{ company: "", title: "", jobDescription: "", contractType: "", location: "", startDate: "", endDate: "" }] },
  [
    {
      name: "professionalExperience",
      label: "Professional Experience",
      type: "array",
      itemFields: [
        { key: "company", label: "Company", placeholder: "e.g. TechCorp", type: "text", required: true },
        { key: "title", label: "Job Title", placeholder: "e.g. Fullstack Developer", type: "text", required: true },
        { key: "jobDescription", label: "Job Description", placeholder: "Describe your role", type: "textarea", multiline: true, rows: 3, required: true },
        { key: "contractType", label: "Contract Type", placeholder: "Choose your contract type", type: "select", options: ContractTypes, required: true },
        { key: "location", label: "Location", placeholder: "e.g. Paris, France", type: "text", required: true },
        { key: "startDate", label: "Start Date", placeholder: "YYYY-MM-DD", type: "date", required: true },
        { key: "endDate", label: "End Date", placeholder: "YYYY-MM-DD", type: "date", required: true },
      ],
    },
  ],
  professionalExperienceSchema
);

export const ResumeForm = generateFormikFormComponent(
  { cvUrl: "" }, 
  [
    {
      name: "cvUrl",
      label: "Resume",
      type: "file",                 
      accept: ".pdf,.doc,.docx",
    },
  ],
);


