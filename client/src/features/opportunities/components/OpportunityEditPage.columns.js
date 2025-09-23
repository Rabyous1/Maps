import {
  ContractTypes,
  visibilityOptions,
  EmploymentTypes,
  WorkModes,
  industryOptions,
  countryOptions,
} from "@/utils/constants";


export const baseFields = [
  { name: "title", label: "Job Title", type: "text", required: true, placeholder: "Enter job title" },
  { name: "contractType", label: "Contract Type", type: "select", required: true, options: ContractTypes },
  { name: "employmentType", label: "Employment Type", type: "select", required: true, options: EmploymentTypes },
  { name: "workMode", label: "Work Mode", type: "select", required: true, options: WorkModes },
  { name: "country", label: "Country", type: "select", required: true, options: countryOptions },
  { name: "city", label: "City", type: "select", required: true, placeholder: "City" },
  { name: "industry", label: "Industry", type: "select", required: true, options: industryOptions },
  { name: "visibility", label: "Visibility", type: "select", required: true, options: visibilityOptions },
  { name: "minExperience", label: "Minimum Experience (years)", type: "text", required: true },
  { name: "maxExperience", label: "Maximum Experience (years)", type: "text", required: true },
  { name: "salaryMinimum", label: "Minimum Salary (€)", type: "text" },
  { name: "dateOfExpiration", label: "Expiration Date", type: "date", required: true },
  { name: "isArchived", label: "Archive", type: "checkbox" },
  { name: "urgent", label: "Urgent", type: "checkbox" },
  { name: "jobDescription", label: "Job Description", type: "editor", placeholder: "Enter the full job description…", fullWidth: true },

];

export const opportunityEditFields = [ ...baseFields];
