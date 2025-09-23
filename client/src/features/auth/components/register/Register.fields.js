import { countryCodeMap } from "@/utils/constants";

export const registerFields = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Your full name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Your email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Your password",
    required: true,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Confirm your password",
    type: "password",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "Your phone number",
    required: true,
  },
  {
    name: "country",
    label: "Country",
    type: "select",
    placeholder: "Choose a country",
    options: Object.entries(countryCodeMap).map(([key, value]) => ({
      value,
      label: value,
    })),
  },
  {
    name: "acceptTerms",
    label: "I accept the terms and conditions",
    type: "checkbox",
    required: true,
  },

];
