export const verifyOtpFields = [
  {
    name: "code",
    type: "otp", // <- Custom type handled in GenericFormikForm
    label: "Code de vérification",
    placeholder: "-",
    fullWidth: true,
    required: true,
  },
]
