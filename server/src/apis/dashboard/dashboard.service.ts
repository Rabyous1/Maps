import { DashboardRepository } from './dashboard.respository';
import { CandidateDashboardQuery } from './dashboard.validation';
import { CandidateDashboardData, RecruiterDashboardData } from './dashboard.interface';

import {
  ApplicationStatus,
  transformContractTypeData,
  transformEmploymentTypeData,
  transformWorkModeData,
  transformVisibilityData,
  transformTypeData,
  transformJobStatusData,
  transformApplicationStatusData,
  transformProfileStatusData,
  InterestStatus
} from '@/utils/helpers/constants';
import HttpException from '@/utils/exceptions/http.exception';


export class DashboardService {
    constructor(private repo = new DashboardRepository()) {}

    async getRecruiterDashboard(recruiterId: string, query: CandidateDashboardQuery): Promise<RecruiterDashboardData> {
        try {
            const [
                rawContract = [],
                rawEmployment = [],
                rawWorkMode = [],
                rawVisibility = [],
                rawType = [],
                rawJobStatus = [],
                rawApplications = [],
                rawCandidates = [],
                applicantsPerOpportunity = [],
                avgExpByStatus = [],
            ] = await Promise.all([
                this.repo.countOpportunitiesByContractType(recruiterId, query.from, query.to),
                this.repo.countOpportunitiesByEmploymentType(recruiterId, query.from, query.to),
                this.repo.countOpportunitiesByWorkMode(recruiterId, query.from, query.to),
                this.repo.countOpportunitiesByVisibility(recruiterId, query.from, query.to),
                this.repo.countOpportunitiesByType(recruiterId, query.from, query.to),
                this.repo.countOpportunitiesByJobStatus(recruiterId, query.from, query.to),
                this.repo.countApplicationsByStatusRecruiter(recruiterId, query.from, query.to),
                this.repo.countCandidatesByProfileStatus(recruiterId, query.from, query.to),
                // this.repo.countApplicantsByOpportunity(recruiterId, query.from, query.to),
                this.repo.countApplicantsByOpportunity(recruiterId, query.from, query.to),
                this.repo.averageExperienceOfApplicants(recruiterId, query.from, query.to, true),
            ]);

            return {
                opportunitiesByContractType: transformContractTypeData(rawContract),
                opportunitiesByEmploymentType: transformEmploymentTypeData(rawEmployment),
                opportunitiesByWorkMode: transformWorkModeData(rawWorkMode),
                opportunitiesByVisibility: transformVisibilityData(rawVisibility),
                opportunitiesByType: transformTypeData(rawType),
                opportunitiesByJobStatus: transformJobStatusData(rawJobStatus),
                applicationsByStatus: transformApplicationStatusData(rawApplications),
                candidatesByProfileStatus: transformProfileStatusData(rawCandidates),
                applicantsPerOpportunity,
                averageExperienceOverall:
                    (await this.repo.averageExperienceOfApplicants(recruiterId, query.from, query.to, false))?.[0]?.averageMonths ?? 0,
                averageExperienceByStatus: avgExpByStatus,
            };
        } catch (error) {
            console.error('Error in getRecruiterDashboard:', error);
            throw new HttpException(500, 'Failed to fetch dashboard data');
        }
    }
    async getDashboard(candidateId: string, query: CandidateDashboardQuery): Promise<CandidateDashboardData> {
        const [appsRaw, resumeCount, avgTimeBetweenUploads, favCount, profileCompletenessPercentage, communicationEngagementLevel, interestRaw] =
            await Promise.all([
                this.repo.countApplicationsByStatus(candidateId, query.from, query.to),
                this.repo.countResumeUploadsDetailed(candidateId, query.from, query.to),
                this.repo.getAverageTimeBetweenUploads(candidateId, query.from, query.to),
                this.repo.countFavorites(candidateId),
                this.repo.calculateProfileCompleteness(candidateId),
                this.repo.getCommunicationEngagementLevel(candidateId),
                this.repo.countInterestByCandidate(candidateId, query.from, query.to),
            ]);

        const statusMap = new Map(appsRaw.map(r => [r.status, +r.count]));
        const applicationsByStatus = Object.values(ApplicationStatus).map(status => ({
            status,
            count: statusMap.get(status) ?? 0,
        }));

        const interestStatuses = [InterestStatus.INTERESTED, InterestStatus.MAYBE, InterestStatus.NOT_INTERESTED, InterestStatus.NOT_MENTIONED];
        const interestMap = new Map(interestRaw.map(r => [r.interest, r.count]));
        const applicationsByInterest = interestStatuses.map(status => ({
            interest: status,
            count: interestMap.get(status) ?? 0,
        }));

        const totalApplications = appsRaw.reduce((sum, r) => sum + +r.count, 0);

        return {
            applicationsByStatus,
            resumeUploads: {
                total: resumeCount.total,
                docCv: resumeCount.docCv,
                video: resumeCount.video,
                avgTimeBetweenUploads,
            },
            favoritesCount: favCount,
            totalApplications,
            profileCompletenessPercentage,
            communicationEngagementLevel,
            applicationsByInterest,
        };
    }
}
