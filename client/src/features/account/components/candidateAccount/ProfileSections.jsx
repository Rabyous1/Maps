import EmailIcon from "@/assets/icons/account/icon-email.svg";
import DateIcon from "@/assets/icons/account/icon-date.svg";
import AddressIcon from "@/assets/icons/account/icon-location.svg";
import PhoneIcon from "@/assets/icons/account/icon-phone.svg";
import { CertificationEmpty, EducationEmpty, LanguageEmpty, NamePicEmpty, PersonalInfoEmpty, ResumeEmpty, SkillsEmpty, SummaryEmpty, WorkExperienceEmpty } from "./EmptyComponents";

export const basicInfosSections = [
  {
    key: "namePicSection",
    EmptyComponent: NamePicEmpty,
    //title: " ",
    fields: [
      { key: "profilePicture", className: "profilePicture"},
      { key: "fullName",name: "fullName",type: "text", className: "fullName"},
      { key: "targetRole", name: "targetRole",type: "text", className:"targetRole"},
      {key: "linkedinLink", name: "linkedinLink",type: "text", className:"linkedinLink"},
    ],
  },
  {
    key: "skills",
    title: "Skills",
    fields: [
      { key: "skills",EmptyComponent: SkillsEmpty},
    ],
  },
];
  export const profileSections = [
    {
      key: "personalInfo",
      title: "Personal Info",
      EmptyComponent:PersonalInfoEmpty,
      primaryFields: [],
      fields: [
        { key: "email", label: "Email", icon: EmailIcon },
        { key: "country", label: "Address", icon: AddressIcon},
        { key: "phone", label: "Phone", icon: PhoneIcon},
        { key: "dateOfBirth", label: "Birth Date", icon: DateIcon},
      ],
    },
    {
  
      key: "professionalSummary",
      title: "Professional Summary",
      primaryFields: [],
      fields: [
        { key: "summary", label: "",EmptyComponent: SummaryEmpty },
      ],
    },
    {
      key: "workExperience",
      title: "Work Experience",
      
      primaryFields: ["company","contractType","location",],
      secondaryFields: ["jobDescription",],
      fields: [
        { key: "professionalExperience",EmptyComponent: WorkExperienceEmpty },
      ],
    },
    {
      key: "resume",
      title: "Resume",
      primaryFields: [],
      fields: [
        { key: "cvUrl", EmptyComponent: ResumeEmpty },
      ],
    },
  {
    key: "education",
    title: "Education",
    primaryFields: ["institution"],
    fields: [
      { key: "education", label: "" , EmptyComponent: EducationEmpty},
    ],
  },
  {
    key: "certification",
    title: "Certifications",
    primaryFields: ["academy"],
    fields: [
      { key: "certification", label: "",EmptyComponent: CertificationEmpty },
    ],
  },
];
export const languageSections = [
  {
    key: "language",
    title: "Language",
    fields: [
      { key: "languages", label: "",EmptyComponent: LanguageEmpty },
    ],
  },
]

