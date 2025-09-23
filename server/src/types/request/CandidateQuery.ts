import { Industry } from "@/utils/helpers/constants";

export type CandidateQuery = {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    keyWord?: string;
    jobTitleAng?: string;
    skills?: string;
    locations?: string;
    industry?: Industry;
    industries?: string;
    monthsOfExperiencesMin?: string;
    monthsOfExperiencesMax?: string;
    isValidXp?: boolean;
    isPentabellMember?: boolean;
    dateCreation?: number;
    isArchived?: boolean;
    experiencesCompany?: string;
    createdBy?: string;
};
