export const editSectionFields = {
  namePicSection: [
    { name: "fullName" },
    { name: "targetRole" },
    { name: "linkedinLink" },
  ],

  personalInfo: [
    { name: "email" },
    { name: "country" },
    { name: "phone" },
    { name: "dateOfBirth" },
  ],

  professionalSummary: [
    { name: "summary" },
  ],

  workExperience: [
    {
      name: "professionalExperience",
      label: "Experience",
      type: "array",
      itemFields: [
        { name: "company" },
        { name: "title" },
        { name: "contractType" },
        { name: "location" },
        { name: "startDate" },
        { name: "endDate" },
        { name: "jobDescription" },
      ]
    }
  ],

  resume: [
    { name: "cvUrl" },
  ],
  skills: [
    {
      name: "skills",
      showRemoveButton: true,
    }, { isEditMode: true }
  ],

  education: [
    {
      name: "education",
      itemFields: [
        { name: "institution" },
        { name: "degree" },
        { name: "startDate" },
        { name: "endDate" },
      ]
    }
  ],

  certification: [
    { name: "certification" }
  ],

  language: [
    {
      name: "languages",
      itemFields: [
        { name: "language" },
        { name: "level" }
      ]
    }
  ],
};
