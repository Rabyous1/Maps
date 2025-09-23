import * as Yup from "yup";

export const updatePasswordValidationSchema = (t) =>
  Yup.object().shape({
    currentPassword: Yup.string()
      .required(t?.("emptyField") || "Required"),
    newPassword: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        t?.("invalidPassword") || "Must include uppercase, lowercase, number, and special character"
      )
      .min(8, t?.("minLength") || "Minimum 8 characters")
      .required(t?.("emptyField") || "Required"),

    confirmNewPassword: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        t?.("invalidPassword") || "Must include uppercase, lowercase, number, and special character"
      )
      .min(8, t?.("minLength") || "Minimum 8 characters")
      .oneOf([Yup.ref("newPassword"), null], t?.("passwordMatch") || "Passwords must match")
      .required(t?.("emptyField") || "Required"),
  });


