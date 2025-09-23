import { Role } from "@/utils/constants";
import * as Yup from "yup";
//import { Role} from "@/utils/constants";
const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
export const registerValidationSchema = (t) =>
  Yup.object().shape({
    fullName: Yup.string()
      .min(3, t?.("minLength") || "Minimum 3 characters.")
      .required(t?.("emptyField") || "Required"),

    email: Yup.string()
      .email(t?.("invalidEmail") || "Invalid email.")
      .required(t?.("emptyField") || "Required"),

    phone: Yup.string()
      .min(3, t?.("minLength") || "Minimum 3 characters")
    ,
    /*dateOfBirth: Yup.date()
      .max(new Date(), t?.("invalidDate") || "Date must be in the past."),*/

    country: Yup.string()
      .required(t?.("emptyField") || "Select a country."),


    /*roles: Yup.string()
      .oneOf(Object.values(Role), t?.("invalidRole") || "Invalid role.")
      .required(t?.("emptyField") || "Required"),*/

    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        t?.("invalidPassword") || "Must include uppercase, lowercase, number, and special character."
      )
      .min(8, t?.("minLength") || "Minimum 8 characters.")
      .required(t?.("emptyField") || "Required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t?.("passwordMatch") || "Passwords must match.")
      .required(t?.("emptyField") || "Required"),

    acceptTerms: Yup.boolean()
      .oneOf([true], t?.("emptyField") || "You must accept the terms."),
  });


export const signInValidationSchema = (t) =>
  Yup.object().shape({
    email: Yup.string()
      .required(t?.("emptyField") ?? "Email is required.")
      .matches(strictEmailRegex, t?.("invalidEmail") ?? "Enter a valid email address."),
    password: Yup.string()
      //.min(8, t?.("minLength") ?? "Minimum 8 characters")
      .required(t?.("emptyField") ?? "Password is required."),
  });

export const forgotPasswordValidationSchema = (t) =>
  Yup.object().shape({
    email: Yup.string()
      .required(t?.("emptyField") ?? "Email is required.")
      .matches(strictEmailRegex, t?.("invalidEmail") ?? "Enter a valid email address."),
  });

export const resetPasswordValidationSchema = (t) =>
  Yup.object().shape({
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        t?.("invalidPassword") ?? "Must include uppercase, lowercase, number, and special character"
      )
      .min(8, t?.("minLength") ?? "Minimum 8 characters")
      .required(t?.("emptyField") ?? "Required"),

    confirmNewPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        t?.("passwordMatch") ?? "Passwords must match"
      )
      .required(t?.("emptyField") ?? "Required"),
  });
  export const chooseRoleValidationSchema = (t) =>
    Yup.object().shape({
      role: Yup.mixed()
        .oneOf([Role.Candidat, Role.Recruteur], t?.("invalidRole") || "Select a valid role.")
        .required(t?.("emptyField") || "Role is required"),
    });

    export const verifyOtpValidationSchema = Yup.object({
  code: Yup.array()
    .of(
      Yup.string()
        .matches(/^[0-9]$/, "Chiffre invalide")
        .required("Obligatoire")
    )
    .min(6, "Le code doit contenir 6 chiffres")
    .max(6, "Le code doit contenir 6 chiffres")
});