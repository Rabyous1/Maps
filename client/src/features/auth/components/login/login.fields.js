import { frontUrls } from "@/utils/front-urls";

export const loginFields = [
  {
    name: "email",
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "Your email",

  },
  {
    name: "password",
    id: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Your password",

  },
 {
    name: "rememberme",
    id: "rememberme",
    label: "Remember Me",
    type: "checkbox",
    required: false,
    extra: {
      label: "Forgot Password ?",
      href: frontUrls.forgotpassword,
    },
  },
];
