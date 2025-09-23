import { ContractTypes, countryOptions, EmploymentTypes, Industry, OpportunityTypeOptions, WorkModes } from "@/utils/constants";
import * as Yup from "yup";

const opportunityTypeValues = OpportunityTypeOptions.map(opt => opt.value);
const contractTypeValues = ContractTypes.map(opt => opt.value);
const countryValues = countryOptions.map(opt => opt.value);
const workModeValues = WorkModes.map(opt => opt.value);
const employmentTypeValues = EmploymentTypes.map(opt => opt.value);
const industryValues = Object.values(Industry);

export const addOppValidationSchema = Yup.object({
  opportunityType: Yup.mixed()
    .oneOf(opportunityTypeValues)
    .required("Opportunity Type is required"),

  industry: Yup.mixed()
    .oneOf(industryValues)
    .required("Industry is required"),

  country: Yup.mixed()
    .oneOf(countryValues)
    .required("Country is required"),

  contractType: Yup.mixed()
    .oneOf(contractTypeValues)
    .required("Contract Type is required"),

  workMode: Yup.mixed()
    .oneOf(workModeValues)
    .notRequired(),

  employmentType: Yup.mixed()
    .oneOf(employmentTypeValues)
    .notRequired(),

  minExperience: Yup.number()
    .integer()
    .min(0, "Minimum experience must be at least 0")
    .required("Minimum experience is required"),

  maxExperience: Yup.number()
    .integer()
    .min(Yup.ref("minExperience"), "Maximum experience must be greater than or equal to minimum experience")
    .required("Maximum experience is required"),

  salaryMinimum: Yup.string().required("Minimum salary is required"),
  dateOfExpiration: Yup.date()
    .required("Expiration date is required")
    .min(new Date(), "Expiration date cannot be in the past"),


  publishAt: Yup.date()
    .nullable()
    .test(
      "no-date-if-publish-now",
      "Cannot schedule a publication date if Publish Now is checked",
      function (value) {
        const { isPublished } = this.parent;
        if (isPublished && value) {
          return false;
        }
        return true;
      }
    ),

  isPublished: Yup.boolean().test(
    "no-publish-now-if-date-set",
    "Cannot select Publish Now if a schedule date is set",
    function (value) {
      const { publishAt } = this.parent;
      if (value && publishAt) {
        return false;
      }
      return true;
    }
  ),
});
