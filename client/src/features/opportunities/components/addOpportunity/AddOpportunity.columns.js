import {
  ContractTypes,
  EmploymentTypes,
  WorkModes,
  industryOptions,
  countryOptions,
  OpportunityTypeOptions,
  cityOptions,
} from "@/utils/constants";


export const baseFields = [
  { name: "title", label: "Job Title", type: "text", required: true, placeholder: "Job title" },
  { name: "industry", label: "Industry", type: "select", required: true, options: industryOptions, placeholder: "Industry" },
  { name: "opportunityType", label: "Opportunity Type", type: "select", required: true, options: OpportunityTypeOptions, placeholder: "Contract Type"  },
  { name: "contractType", label: "Contract Type", type: "select", required: true, options: ContractTypes, placeholder: "Contract Type"  },
  { name: "employmentType", label: "Employment Type", type: "select", required: true, options: EmploymentTypes , placeholder: "Employment Type"},
  { name: "workMode", label: "Work Mode", type: "select", required: true, options: WorkModes, placeholder: "Work Mode" },
  { name: "country", label: "Country", type: "select", required: true, options: countryOptions, placeholder: "Country" },
  { name: "city", label: "City", type: "select", required: true, options: [], placeholder: "City" },
  { name: "minExperience", label: "Minimum Experience (years)", type: "text", required: true, placeholder: "Minimum Experience" },
  { name: "maxExperience", label: "Maximum Experience (years)", type: "text", required: true, placeholder: "Maximum Experience"  },
  { name: "salaryMinimum", label: "Minimum Salary (€)", type: "text", placeholder: "Minimum Salary" },
  { name: "dateOfExpiration", label: "Expiration Date", type: "date", required: true},
  { name: "publishAt", label: "Schedule a publication date", type: "date", required: false},
  { name: "urgent", label: "Urgent", type: "checkbox",  required: false},
  { name: "visibility", label: "Draft", type: "checkbox", required: false },
  { name: "isPublished", label: " Publish now", type: "checkbox",  required: false },
  { name: "jobDescription", label: "Job Description", type: "editor", fullWidth: true },

];

export const opportunityAddFields = [ ...baseFields];
