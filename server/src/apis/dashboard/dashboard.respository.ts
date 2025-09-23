import { AppDataSource } from '@/utils/databases';
import { Repository } from 'typeorm';
import { ApplicationI } from '../application/application.entity';
import { FileI } from '../storage/files.interface';
import { ApplicationEntitySchema } from '../application/application.schema';
import { FileEntitySchema } from '../storage/files.model';
import { ApplicationStatus } from '@/utils/helpers/constants';
import { MessageEntitySchema } from '../messages/messages.model';
import { Message } from '../messages/messages.interfaces';
import { Opportunity } from '../opportunity/opportunity.interfaces';
import { OpportunityEntitySchema } from '../opportunity/opportunity.schema';


export class DashboardRepository {
    private appRepo: Repository<ApplicationI>;
    private fileRepo: Repository<FileI>;
    private messageRepo: Repository<Message>;
    private oppRepo: Repository<Opportunity>;

    constructor() {
        this.appRepo = AppDataSource.getRepository(ApplicationEntitySchema);
        this.fileRepo = AppDataSource.getRepository(FileEntitySchema);
        this.messageRepo = AppDataSource.getRepository(MessageEntitySchema);
        this.oppRepo = AppDataSource.getRepository(OpportunityEntitySchema);
    }
    //////////////////////////////////////////////// recruiter ////////////////////////////////////////////////////////

    /**
     * Count opportunities grouped by status
     */
    async countOpportunitiesByStatus(recruiterId: string, from: Date, to: Date): Promise<{ status: string; count: number }[]> {
        const raw = await this.oppRepo
            .createQueryBuilder('opp')
            .select('opp.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('opp.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('opp.status')
            .getRawMany<{ status: string; count: string }>();
        return raw.map(r => ({ status: r.status, count: Number(r.count) }));
    }

    /**
     * Count opportunities by contract type
     */
    async countOpportunitiesByContractType(recruiterId: string, from: Date, to: Date): Promise<{ contractType: string; count: number }[]> {
        const raw = await this.oppRepo
            .createQueryBuilder('opp')
            .select('opp.contractType', 'contractType')
            .addSelect('COUNT(*)', 'count')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('opp.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('opp.contractType')
            .getRawMany<{ contractType: string; count: string }>();
        return raw.map(r => ({ contractType: r.contractType, count: Number(r.count) }));
    }

    /**
     * Count opportunities by employment type
     */
    async countOpportunitiesByEmploymentType(recruiterId: string, from: Date, to: Date): Promise<{ employmentType: string; count: number }[]> {
        const raw = await this.oppRepo
            .createQueryBuilder('opp')
            .select('opp.employmentType', 'employmentType')
            .addSelect('COUNT(*)', 'count')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('opp.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('opp.employmentType')
            .getRawMany<{ employmentType: string; count: string }>();
        return raw.map(r => ({ employmentType: r.employmentType, count: Number(r.count) }));
    }

    /**
     * Count opportunities by work mode
     */
    async countOpportunitiesByWorkMode(recruiterId: string, from: Date, to: Date): Promise<{ workMode: string; count: number }[]> {
        const raw = await this.oppRepo
            .createQueryBuilder('opp')
            .select('opp.workMode', 'workMode')
            .addSelect('COUNT(*)', 'count')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('opp.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('opp.workMode')
            .getRawMany<{ workMode: string; count: string }>();
        return raw.map(r => ({ workMode: r.workMode, count: Number(r.count) }));
    }

    /**
     * Count opportunities by visibility
     */
    /**
/**
 * Count opportunities by visibility (depuis la dernière version du JSON)
 */
    async countOpportunitiesByVisibility(recruiterId: string, from: Date, to: Date): Promise<{ visibility: string; count: number }[]> {
        const raw = await this.oppRepo
            .createQueryBuilder('opp')
            // On va chercher l'élément final du tableau JSON
            .select(
                `(opp."OpportunityVersions" -> (jsonb_array_length(opp."OpportunityVersions") - 1))
         ->> 'visibility'`,
                'visibility',
            )
            .addSelect('COUNT(*)', 'count')
            .where('opp."createdById" = :recruiterId', { recruiterId })
            .andWhere('opp."createdAt" BETWEEN :from AND :to', { from, to })
            .groupBy('visibility')
            .getRawMany<{ visibility: string; count: string }>();

        return raw.map(r => ({ visibility: r.visibility, count: Number(r.count) }));
    }

    /**
     * Count opportunities by opportunity type
     */
    async countOpportunitiesByType(recruiterId: string, from: Date, to: Date): Promise<{ type: string; count: number }[]> {
        const raw = await this.oppRepo
            .createQueryBuilder('opp')
            .select('opp.opportunityType', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('opp.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('opp.opportunityType')
            .getRawMany<{ type: string; count: string }>();
        return raw.map(r => ({ type: r.type, count: Number(r.count) }));
    }

    /**
     * Count opportunities by job status
     */
    async countOpportunitiesByJobStatus(recruiterId: string, from: Date, to: Date): Promise<{ jobStatus: string; count: number }[]> {
        const raw = await this.oppRepo
            .createQueryBuilder('opp')
            .select('opp.status', 'jobStatus')
            .addSelect('COUNT(*)', 'count')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('opp.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('opp.status')
            .getRawMany<{ jobStatus: string; count: string }>();
        return raw.map(r => ({ jobStatus: r.jobStatus, count: Number(r.count) }));
    }

    /**
     * Count applications by application status
     */
    async countApplicationsByStatusRecruiter(recruiterId: string, from: Date, to: Date): Promise<{ applicationStatus: string; count: number }[]> {
        const raw = await this.appRepo
            .createQueryBuilder('app')
            .select('app.status', 'applicationStatus')
            .addSelect('COUNT(*)', 'count')
            .innerJoin('app.opportunity', 'opp')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('app.applicationDate BETWEEN :from AND :to', { from, to })
            .groupBy('app.status')
            .getRawMany<{ applicationStatus: string; count: string }>();
        return raw.map(r => ({ applicationStatus: r.applicationStatus, count: Number(r.count) }));
    }

    /**
     * Count distinct candidates by candidate profile status
     */
    async countCandidatesByProfileStatus(recruiterId: string, from: Date, to: Date): Promise<{ profileStatus: string; count: number }[]> {
        const raw = await this.appRepo
            .createQueryBuilder('app')
            .select('candidate.status', 'profileStatus')
            .addSelect('COUNT(DISTINCT app.candidateId)', 'count')
            .innerJoin('app.candidate', 'candidate')
            .innerJoin('app.opportunity', 'opp')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('app.applicationDate BETWEEN :from AND :to', { from, to })
            .groupBy('candidate.status')
            .getRawMany<{ profileStatus: string; count: string }>();

        return raw.map(r => ({ profileStatus: r.profileStatus, count: Number(r.count) }));
    }

    /**
     * Number of applicants per opportunity
     */
    async countApplicantsByOpportunity(recruiterId: string, from: Date, to: Date): Promise<{ opportunityTitle: string; applicants: number }[]> {
        const raw = await this.appRepo
            .createQueryBuilder('app')
            .select('opp.id', 'opportunityId')
            .addSelect(`(opp."OpportunityVersions"->0->>'title')`, 'title')
            .addSelect('COUNT(*)', 'applicants')
            .innerJoin('app.opportunity', 'opp')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('app.applicationDate BETWEEN :from AND :to', { from, to })
            .groupBy('opp.id')
            .addGroupBy(`(opp."OpportunityVersions"->0->>'title')`)
            .getRawMany<{ opportunityId: string; title: string; applicants: string }>();

        return raw.map(r => ({
            opportunityTitle: r.title ?? 'Untitled',
            applicants: Number(r.applicants),
        }));
    }

    async averageExperienceOfApplicants(
        recruiterId: string,
        from: Date,
        to: Date,
        groupByStatus = false,
    ): Promise<{ status?: string; averageMonths: number }[]> {
        const qb = this.appRepo
            .createQueryBuilder('app')
            .select(groupByStatus ? 'app.status' : 'NULL', 'status')
            .addSelect('AVG(candidate.monthsOfExperiences)', 'averageMonths')
            .innerJoin('app.candidate', 'candidate')
            .innerJoin('app.opportunity', 'opp')
            .where('opp.createdById = :recruiterId', { recruiterId })
            .andWhere('app.applicationDate BETWEEN :from AND :to', { from, to });

        if (groupByStatus) qb.groupBy('app.status');

        const raw = await qb.getRawMany<{ status: string | null; averageMonths: string | null }>();

        const parsed = raw.map(r => ({
            status: r.status ?? undefined,
            averageMonths: r.averageMonths ? Number(r.averageMonths) : 0,
        }));

        if (!groupByStatus) {
            return parsed.map(p => ({ status: p.status, averageMonths: p.averageMonths }));
        }
        const allStatuses = (Object.values(ApplicationStatus) as unknown[]).filter(v => typeof v === 'string') as string[];

        const map = new Map<string, number>();
        parsed.forEach(p => {
            if (p.status) map.set(p.status, p.averageMonths);
        });

        const result = allStatuses.map(status => ({
            status,
            averageMonths: map.get(status) ?? 0,
        }));

        return result;
    }
    //////////////////////////////////////////////// candidate ////////////////////////////////////////////////////////
    // applications by status
    async countApplicationsByStatus(candidateId: string, from: Date, to: Date) {
        return this.appRepo
            .createQueryBuilder('app')
            .select('app.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('app.candidateId = :candidateId', { candidateId })
            .andWhere('app.applicationDate BETWEEN :from AND :to', { from, to })
            .groupBy('app.status')
            .getRawMany<{ status: ApplicationStatus; count: string }>();
    }

    // resume uploads in period
    async countResumeUploadsDetailed(candidateId: string, from: Date, to: Date) {
        const result = await this.fileRepo
            .createQueryBuilder('file')
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN file.resource = 'resumes' THEN 1 ELSE 0 END)`, 'docCv')
            .addSelect(`SUM(CASE WHEN file.resource = 'video' THEN 1 ELSE 0 END)`, 'video')
            .where('file.candidateId = :candidateId', { candidateId })
            .andWhere('file.createdAt BETWEEN :from AND :to', { from, to })
            .andWhere('file.resource IN (:...resources)', { resources: ['resumes', 'video'] })
            .getRawOne<{ total: string; docCv: string; video: string }>();

        const safeResult = result ?? { total: '0', docCv: '0', video: '0' };

        return {
            total: Number(safeResult.total),
            docCv: Number(safeResult.docCv),
            video: Number(safeResult.video),
        };
    }
    async getAverageTimeBetweenUploads(candidateId: string, from: Date, to: Date): Promise<number | null> {
        const uploadDates = await this.fileRepo
            .createQueryBuilder('file')
            .select('file.createdAt', 'createdAt')
            .where('file.candidateId = :candidateId', { candidateId })
            .andWhere('file.createdAt BETWEEN :from AND :to', { from, to })
            .andWhere('file.resource IN (:...resources)', { resources: ['resumes', 'video'] })
            .orderBy('file.createdAt', 'ASC')
            .getRawMany<{ createdAt: Date }>();

        if (uploadDates.length < 2) return null;

        let totalDiffMs = 0;
        for (let i = 1; i < uploadDates.length; i++) {
            const prev = new Date(uploadDates[i - 1].createdAt).getTime();
            const curr = new Date(uploadDates[i].createdAt).getTime();
            totalDiffMs += curr - prev;
        }

        const avgDiffMs = totalDiffMs / (uploadDates.length - 1);

        // return avgDiffMs / (1000 * 60 * 60); in hours
        return avgDiffMs / (1000 * 60 * 60 * 24); //in days
    }
    async calculateProfileCompleteness(candidateId: string): Promise<number> {
        const user = await AppDataSource.getRepository('user')
            .createQueryBuilder('c')
            .select([
                'c.targetRole',
                'c.skills',
                'c.education',
                'c.professionalExperience',
                'c.certification',
                'c.languages',
                'c.summary',
                'c.dateOfBirth',
                'c.profilePicture',
                'c.country',
                'c.phone',
                'c.linkedinLink',
            ])
            .where('c.id = :candidateId', { candidateId })
            .getOne();

        if (!user) return 0;

        const keys = [
            'targetRole',
            'skills',
            'education',
            'professionalExperience',
            'certification',
            'languages',
            'summary',
            'dateOfBirth',
            'profilePicture',
            'country',
            'phone',
            'linkedinLink',
        ];

        let filledCount = 0;

        for (const key of keys) {
            const value = (user as any)[key];

            if (typeof value === 'string' && ['skills'].includes(key)) {
                if (value.trim() !== '') filledCount++;
            } else if (typeof value === 'object' && value !== null) {
                if (Object.keys(value).length > 0) filledCount++;
            } else if (typeof value === 'string') {
                if (value.trim() !== '') filledCount++;
            } else if (value !== null && value !== undefined) {
                filledCount++;
            }
        }

        return Math.round((filledCount / keys.length) * 100);
    }

    async hasCommunication(candidateId: string): Promise<boolean> {
        const result = await this.messageRepo
            .createQueryBuilder('msg')
            .where('msg.senderId = :candidateId', { candidateId })
            .orWhere('msg.receiverId = :candidateId', { candidateId })
            .getCount();

        return result > 0;
    }
    async getCommunicationEngagementLevel(candidateId: string): Promise<number> {
        const totalApps = await this.appRepo.createQueryBuilder('app').where('app.candidateId = :candidateId', { candidateId }).getCount();

        if (totalApps === 0) return 0;

        const result = await this.messageRepo
            .createQueryBuilder('msg')
            .where('msg.senderId = :candidateId OR msg.receiverId = :candidateId', { candidateId })
            .select(
                `COUNT(DISTINCT
           CASE WHEN msg.senderId = :candidateId THEN msg.receiverId ELSE msg.senderId END
         )`,
                'distinctCount',
            )
            .setParameter('candidateId', candidateId)
            .getRawOne<{ distinctCount: string }>();

        const distinct = Number(result?.distinctCount ?? 0);
        return Math.round((distinct / totalApps) * 100);
    }

    /* favorite opportunities */
    async countFavorites(candidateId: string) {
        const result = await this.appRepo.query(
            `SELECT COUNT(*)::int AS count 
       FROM candidate_favorites 
       WHERE candidate_id = $1`,
            [candidateId],
        );
        return result[0]?.count ?? 0;
    }
    async countInterestByCandidate(candidateId: string, from: Date, to: Date): Promise<{ interest: string; count: number }[]> {
        const raw = await this.appRepo
            .createQueryBuilder('app')
            .select('app.interest', 'interest')
            .addSelect('COUNT(*)', 'count')
            .where('app.candidateId = :candidateId', { candidateId })
            .andWhere('app.applicationDate BETWEEN :from AND :to', { from, to })
            .groupBy('app.interest')
            .getRawMany<{ interest: string; count: string }>();

        return raw.map(r => ({
            interest: r.interest,
            count: Number(r.count),
        }));
    }
}
