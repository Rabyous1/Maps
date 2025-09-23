import * as Yup from "yup";
import { Role} from "@/utils/constants";
const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;

export const userValidationSchema = (t) =>
  Yup.object().shape({
    fullName: Yup.string()
      .min(3, t?.("minLength") || "Minimum 3 characters")
      .required(t?.("emptyField") || "Required"),

     email: Yup.string()
      .matches(strictEmailRegex, t?.("invalidEmail") || "Invalid email format")
      .required(t?.("emptyField") || "Required"),

    phone: Yup.string()
      .min(3, t?.("minLength") || "Minimum 3 characters")
,
    dateOfBirth: Yup.date()
      .max(new Date(), t?.("invalidDate") || "Date must be in the past"),

    country: Yup.string()
            .required(t?.("emptyField") || "Select a country."),

    // roles: Yup.string()
    //   .oneOf(Object.values(Role), t?.("invalidRole") || "Invalid role")
    //   .required(t?.("emptyField") || "Required"),
      
         
  });