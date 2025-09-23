import EmailIcon from "@/assets/icons/account/icon-email.svg";
import AddressIcon from "@/assets/icons/account/icon-location.svg";
import WebsiteIcon from "@/assets/icons/account/icon-website.svg";
import SizeIcon from "@/assets/icons/account/icon-size.svg";
import IconLaw from '@/assets/icons/account/icon-law.svg';
import IconMoneyBill from '@/assets/icons/opportunities/icon-moneyBill.svg';

import { NamePicEmpty, PersonalInfoEmpty } from "../candidateAccount/EmptyComponents";
import { companySizeOptions, LegalStatus } from "@/utils/constants";

export const profileSections = [
   {
    key: "recruiterSummary",
    title: "Bio",
    fields: [
      {
        key: "recruiterSummary",
        label: "Write a short bio about you.", 
        placeholder: "Experienced HR manager with 8+ years in talent acquisition and employee relations..",
        className: "recruiterSummaryField",
        multiline: true,
        minRows: 4, 
        maxRows: 10, 
      },
    ],
  },
  {
    key: "companyOverview",
    title: "Company Overview",
    fields: [
      { key: "companyName", label: "Company Name", icon: EmailIcon, placeholder: "E.g : Acme Corp" },
      { key: "companyWebsite", label: "Website", icon: WebsiteIcon, placeholder: "https://example.com" },
       {
        key: "companySize",
        name: "companySize",
        label: "Company Size",
        icon: SizeIcon,
        placeholder: "Select company size",
        type: "select",
        options: companySizeOptions,
      },
      // { key: "industry", label: "Industry", icon: IconWork, placeholder: "E.g : Software, Finance" },
      {
  key: "legalStatus",
  label: "Legal Status",
  icon: IconLaw,
  placeholder: "Select legal status",
  type: "select",
  options: Object.values(LegalStatus).map((value) => ({
    value,
    label: value
  })),
},

      { key: "fiscalNumber", label: "Fiscal Number", icon: IconMoneyBill, placeholder: "E.g : 123456789" },
      // { key: "headquarters", label: "Headquarters", icon: IconHeadquarters, placeholder: "City, Country" },
      // { key: "foundedYear", label: "Year Founded", icon: DateIcon, placeholder: "E.g : 2015" },
    ],
  },
];

export const basicInfosSections = [
  {
    key: "namePicSection",
    title: "",
    EmptyComponent: NamePicEmpty,
    fields: [
      { key: "profilePicture", className: "profilePicture" },
      { key: "fullName", name: "fullName", type: "text", className: "fullName", placeholder: "Full name" },
      { key: "position", name: "position", type: "text", className: "position", placeholder: "Position / Title" },
      { key: "department", name: "department", type: "text", className: "department", placeholder: "Department" },
    ],
  },
  {
    key: "personalInfo2",
    title: "Personal Info",
    EmptyComponent: PersonalInfoEmpty,
    primaryFields: [],
    fields: [
      { key: "email", label: "Email", icon: EmailIcon, placeholder: "name@company.com" },
      { key: "country", label: "Address", icon: AddressIcon, placeholder: "Country or City" },
    ],
  },
];
