export type CandidateQueryConditions = {
    dateCreation?: object;
    isArchived?: boolean;
    name?: RegExp;
    industry?: string;
    industries?: string[];
    industriesBinary?: string;
    monthsOfExperiences?: object;
    isValidXp?: boolean;
    isPentabellMember?: boolean;
    experiencesCompany?: RegExp;
    createdBy?: string;
}