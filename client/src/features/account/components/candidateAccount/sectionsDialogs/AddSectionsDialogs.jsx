import { CertificationForm, EducationForm, LanguageForm, NamePicForm, PersonalInfoForm, ProfessionalExperienceForm, ResumeForm, SkillsForm, SummaryForm } from "./contents";
import { MakeDialog } from "./MakeDialog";


export const summaryDialog= MakeDialog("Professional Summary", SummaryForm);
export const skillsDialog= MakeDialog("Skills",SkillsForm);
export const languageDialog= MakeDialog("Language",LanguageForm);
export const certificationsDialog= MakeDialog("Certification",CertificationForm);
export const resumeDialog= MakeDialog("Resume",ResumeForm);
export const workExperienceDialog= MakeDialog("WorkExperience",ProfessionalExperienceForm);
export const educationDialog= MakeDialog("Education",EducationForm);
export const personalInfoDialog= MakeDialog("Personal Info",PersonalInfoForm);
export const namePicDialog= MakeDialog("About Me",NamePicForm);

