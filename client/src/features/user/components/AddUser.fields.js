import { countryCodeMap, RoleWithoutAdmin } from "@/utils/constants";

   export const addUserFields = [
        { name: "fullName", label: "Fullname", type: "text", placeholder: "Your fullname", required: true },
        { name: "email", label: "Email", type: "email", placeholder: "Your email", required: true },
        { name: "phone", label: "Phone", type: "tel"},
        { name: "dateOfBirth", label: "Birth Date", type: "date" },
        {
            name: "country",
            label: "Country",
            type: "select",
           options: Object.entries(countryCodeMap).map(([key, value]) => ({
              value,
              label: value, 
            })),
          },
          {
            name: "roles",
            label: "Role",
            type: "select",
            placeholder: "Your role",
            ariaLabel:"Select a role",
            options: Object.entries(RoleWithoutAdmin).map(([key, value]) => ({
              value,
              label: value,
            })),
          },
    ];
       export const updateUserFields = [
        { name: "fullName", label: "Fullname", type: "text", placeholder: "Your fullname", required: true },
        { name: "email", label: "Email", type: "email", placeholder: "Your email", required: true },
        { name: "phone", label: "Phone", type: "tel"},
        { name: "dateOfBirth", label: "Birth Date", type: "date" },
        {
            name: "country",
            label: "Country",
            type: "select",
           options: Object.entries(countryCodeMap).map(([key, value]) => ({
              value,
              label: value, 
            })),
          },
    ];