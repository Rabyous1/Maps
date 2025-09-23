import * as Yup from "yup";
import {
  ContractTypes,
  LanguageLevels,
  LanguageOptions,
  LegalStatus,
  countryCodeMap,
} from "@/utils/constants";

const isoDateString = (label, required = true) => {
  let schema = Yup.string()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      `${label} must be in YYYY-MM-DD format`
    )
    .test(
      "is-valid-date",
      `${label} must be a valid calendar date`,
      value => {
        if (!value) return !required;           // empty if not required
        const [yStr, mStr, dStr] = value.split("-");
        const y = Number(yStr), m = Number(mStr), d = Number(dStr);
        if (m < 1 || m > 12 || d < 1 || d > 31) return false;
        const dt = new Date(value);
        return !isNaN(dt.getTime());
      }
    );
  if (required) schema = schema.required(`${label} is required`);
  return schema;
};

Yup.addMethod(Yup.string, "minWords", function (min, msg) {
  return this.test("min-words", msg, val => {
    if (!val) return true;
    return val.trim().split(/\s+/).length >= min;
  });
});

const arrayOfObjects = shape =>
  Yup.array().of(Yup.object().shape(shape)).nullable().notRequired();

export const namePicSchema = Yup.object({
  fullName:Yup.string().required("Fullname is required").minWords(2, "Fullname must be at least 2 words"),
  targetRole: Yup.string()
    .nullable()
    .notRequired(),
    linkedinLink: Yup.string()
    .nullable()
    .notRequired()
    .test("is-linkedin-url", "LinkedIn link must be a valid LinkedIn URL starting with http:// or https:// and respect format.", (value) => {
      if (!value) return true;

      return /^https?:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/.test(value.trim());
    }),
});
export const personalInfoSchema = Yup.object({
  email: Yup.string()
    .email("Must be a valid email address")
    .required("Email is required"),

  dateOfBirth: isoDateString("Date Of Birth", false) 
   .required("Date of birth is required")
    .test(
      "not-in-future",
      "Date of birth cannot be in the future",
      (val) => {
        if (!val) return true;
        return new Date(val) <= new Date();
      }
    ),

  phone: Yup.string()
    .matches(
      /^\+?[1-9](?:[ ]?\d){7,14}$/,
    "Phone number is not valid (E.164 format expected)"
    )
    .required("Phone number is required"),

  country: Yup.string()
    .oneOf(
      Object.values(countryCodeMap),
      "Select a valid country"
    )
    .required("Country is required"),
});
export const summarySchema = Yup.object({
  summary: Yup.string()
    .nullable()
    // .required()
    .minWords(5, "Summary must be at least 5 words"),
});

export const skillsSchema = Yup.object({
  skills: Yup.array()
    .of(
      Yup.string()
        .trim()
        .required("Each skill is required")
    )
    .min(1, "At least one skill is required")
    .required("Skills are required"),
});


export const languageSchema = Yup.object({
  languages: arrayOfObjects({
    name: Yup.string()
      .oneOf(LanguageOptions, "Invalid language")
      .required("Language is required"),
    level: Yup.string()
      .oneOf(Object.values(LanguageLevels), "Invalid level")
      .required("Proficiency level is required"),
  }),
});

const educationShape = {
  institution: Yup.string().required("Institution is required"),
  degree:      Yup.string().required("Degree is required"),
  fieldOfStudy:Yup.string().required("Field of Study is required"),

  startDate: isoDateString("Start Date"),

  endDate: isoDateString("End Date")
    .test(
      "end-after-start",
      "End Date must be after Start Date",
      function (endDate) {
        const { startDate } = this.parent;
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
      }
    ),
};
export const educationSchema = Yup.object({
  education: arrayOfObjects(educationShape),
});

const certificationShape = {
  academy:   Yup.string().required("Issuer is required"),
  title:     Yup.string().required("Certification Title is required"),

  startDate: isoDateString("Issue Date"),

  endDate: isoDateString("Expiration Date")
    .test(
      "end-after-start",
      "Expiration must be after Issue Date",
      function (endDate) {
        const { startDate } = this.parent;
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
      }
    ),
};
export const certificationSchema = Yup.object({
  certification: arrayOfObjects(certificationShape),
});

const experienceShape = {
  company:        Yup.string().required("Company is required"),
  title:          Yup.string().required("Job Title is required"),
  jobDescription: Yup.string().required("Job Description is required"),
  contractType:   Yup.string()
    .oneOf(ContractTypes.map(c => c.value), "Invalid contract type")
    .required("Contract type is required"),
  location:       Yup.string().required("Location is required"),

  startDate: isoDateString("Start Date"),

  endDate: isoDateString("End Date")
    .test(
      "end-after-start",
      "End Date must be after Start Date",
      function (endDate) {
        const { startDate } = this.parent;
        if (!startDate || !endDate) return true;
        return new Date(endDate) >= new Date(startDate);
      }
    ),
};
export const professionalExperienceSchema = Yup.object({
  professionalExperience: arrayOfObjects(experienceShape),
});

export const recruiterBasicInfoSchema = Yup.object({
  position: Yup.string()
    .required("Position is required")
    .minWords(1, "Position must be at least 1 word"),

  department: Yup.string()
    .required("Department is required")
    .minWords(1, "Department must be at least 1 word"),
});

export const recruiterCompanyInfoSchema = Yup.object({
  companyName: Yup.string()
    .required("Company Name is required")
    .minWords(1, "Company Name must be at least 1 word"),

  companyWebsite: Yup.string()
    .nullable()
    .required()
    .url("Company Website must be a valid URL"),

  companySize: Yup.string()
    .nullable()
    .required(),

  recruiterSummary: Yup.string()
    .nullable()
    .required()
    .minWords(5, "Summary must be at least 5 words"),
});

export const recruiterLegalInfoSchema = Yup.object({
  legalStatus: Yup.string()
    .oneOf(Object.values(LegalStatus), "Invalid Legal Status")
    .required("Legal Status is required"),

  fiscalNumber: Yup.string()
    .nullable()
    .required()
    .matches(/^[A-Z]{2}\d{8,12}$/, "Invalid Fiscal Number format (e.g. TN123456789)"),

});


/*
// Recruiter Summary
export const recruiterSummarySchema = Yup.object({
  recruiterSummary: Yup.string()
    .nullable()
    .notRequired()
    .test(
      "min-words",
      "Recruiter Summary must be at least 5 words",
      value => !value || value.trim().split(/\s+/).filter(Boolean).length >= 5
    ),
});

// Industry
export const industrySchema = Yup.object({
  industry: Yup.string()
    .oneOf(Object.values(Industry))
    .nullable()
    .notRequired(),
});

// Status
export const statusSchema = Yup.object({
  status: Yup.string()
    .oneOf(Object.values(CandidateStatus), "Invalid status")
    .nullable()
    .notRequired(),
});

// Legal Info (for recruiters)
export const legalInfoSchema = Yup.object({
  legalStatus: Yup.string()
    .oneOf(Object.values(LegalStatus))
    .nullable()
    .notRequired(),
  fiscalNumber: Yup.string().nullable().notRequired(),
}); */


  