import { ContractType, Countries, EmploymentType, Industry, JobStatus, Language, OpportunityType, Source, Visibility, WorkMode } from "@/utils/helpers/constants";
import { User } from "../user/interfaces/user.interfaces";



export interface City {
  name: string;
  lat: number;
  lng: number;
}

 export interface OpportunityVersion {
  metaTitle: string;
  metaDescription: string;
  title: string;
  alt?: string;
  url: string;
  language: Language;
  jobDescription: string;
  visibility: Visibility;
  isArchived: boolean;
}

export interface Opportunity {
    id?: string;
    reference: string;
    isPublished?: boolean;
    publishAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    status: JobStatus;
    opportunityType: OpportunityType;
    dateOfExpiration?: Date;
    industry: Industry;
    urgent?: boolean;
    country: typeof Countries[number];
    contractType: ContractType;
    minExperience: number;
    maxExperience: number;
    salaryMinimum?: string;
    source?: Source;
    workMode?: WorkMode;
    employmentType?: EmploymentType;
    OpportunityVersions: OpportunityVersion[];
    createdBy: User;
    applicants: User[];
    city?: City;
}
