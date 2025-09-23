import { Opportunity } from '@/apis/opportunity/opportunity.interfaces';
import { User } from './user.interfaces';
import { Industry, candidateStatus, LanguageLevel } from '@/utils/helpers/constants';

export interface Education {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
  toPresent?: boolean;
}

export interface Experience {
  company: string;
  title: string;
  jobDescription: string;
  contractType?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  toPresent?: boolean;
}

export interface Certification {
  academy: string;
  title: string;
  startDate?: string;
  endDate?: string;
  toPresent?: boolean;
}

export interface Languages {
  name: string;
  level: LanguageLevel;
}

export interface CandidateUser extends User {
    targetRole?: string;
    skills?: string[];
    education?: Education[];
    certification?: Certification[];
    professionalExperience?: Experience[];
    industry?: Industry;
    languages?: Languages[];
    nationalities?: string[];
    monthsOfExperiences?: number;
    numberOfCertifications?: number;
    numberOfEducations?: number;
    numberOfSkills?: number;
    numberOfExperiences?: number;
    numberOfLanguages?: number;
    summary?: string;
    status?: candidateStatus;
    cvUrl?: string | null;
    cvVideoUrl?: string | null;
    favorites?: Opportunity[];
    profileCompleteness?: number;
}
