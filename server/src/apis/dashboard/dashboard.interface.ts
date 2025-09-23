import { InterestStatus } from "@/utils/helpers/constants";

export interface CandidateDashboardData {
    applicationsByStatus: { status: string; count: number }[];
    resumeUploads: {
        total: number;
        docCv: number;
        video: number;
        avgTimeBetweenUploads: number | null;
    };
    favoritesCount: number;
    totalApplications: number;
    profileCompletenessPercentage: number;
    communicationEngagementLevel: number;
    applicationsByInterest: {
        interest: InterestStatus;
        count: number;
    }[];
} 
export interface RecruiterDashboardData {
    opportunitiesByContractType: { contractType: string; count: number }[];
    opportunitiesByEmploymentType: { employmentType: string; count: number }[];
    opportunitiesByWorkMode: { workMode: string; count: number }[];
    opportunitiesByVisibility: { visibility: string; count: number }[];
    opportunitiesByType: { type: string; count: number }[];
    opportunitiesByJobStatus: { jobStatus: string; count: number }[];
    applicationsByStatus: { applicationStatus: string; count: number }[];
    candidatesByProfileStatus: { profileStatus: string; count: number }[];
    applicantsPerOpportunity: { opportunityTitle: string; applicants: number }[];
    averageExperienceOverall: number;
    averageExperienceByStatus: { status?: string; averageMonths: number }[];
}