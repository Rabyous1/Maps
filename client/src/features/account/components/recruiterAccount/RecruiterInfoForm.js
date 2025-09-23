import { generateFormikFormComponent } from "../candidateAccount/sectionsDialogs/contents";
import { recruiterBasicInfoSchema, recruiterCompanyInfoSchema, recruiterLegalInfoSchema } from "../../validations/account.validations";
import { companySizeOptions, LegalStatus } from "@/utils/constants";

export const RecruiterBasicInfoForm = generateFormikFormComponent(
  {
    position: "",
    department: "",
  },
  [
    {
      name: "position",
      label: "Position",
      type: "text",
      placeholder: "e.g. Talent Acquisition Manager",
      required: true,
    },
    {
      name: "department",
      label: "Department",
      type: "text",
      placeholder: "e.g. HR",
      required: true,
    },
  ],
  recruiterBasicInfoSchema
);

export const RecruiterCompanyInfoForm = generateFormikFormComponent(
  {
    companyName: "",
    companyWebsite: "",
    companySize: "",
    recruiterSummary: "",
  },
  [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      placeholder: "e.g. OpenAI",
      required: true,
    },
    {
      name: "companyWebsite",
      label: "Company Website",
      type: "text",
      placeholder: "https://company.com",
    },
    // {
    //   name: "companySize",
    //   label: "Company Size",
    //   type: "text",
    //   placeholder: "e.g. 100-500 employees",
    // },
    {
        key: "companySize",
        name: "companySize",
        label: "Company Size",
        placeholder: "Select company size",
        type: "select",
        options: companySizeOptions,
      },
    {
      name: "recruiterSummary",
      label: "Summary",
      multiline: true,
      rows: 4,
      placeholder: "Describe your company or role",
    },
  ],
  recruiterCompanyInfoSchema
);

export const RecruiterLegalInfoForm = generateFormikFormComponent(
  {
    legalStatus: "",
    fiscalNumber: "",
  },
  [
    {
      name: "legalStatus",
      label: "Legal Status",
      type: "select", 
      options: Object.entries(LegalStatus).map(([value, label]) => ({
        label,
        value,
      })),
      placeholder: "Select legal status",
    },
    {
      name: "fiscalNumber",
      label: "Fiscal Number",
      type: "text",
      placeholder: "e.g. TN123456789",
    },
  ],
  recruiterLegalInfoSchema
);
