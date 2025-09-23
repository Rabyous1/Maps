import { AppDataSource } from '@/utils/databases';
import { Between, Repository } from 'typeorm';
import { ApplicationI } from './application.entity';
import { ApplicationEntitySchema } from './application.schema';
import { ApplicationStatus, InterestStatus } from '@/utils/helpers/constants';

export class ApplicationRepository {
    public repository: Repository<ApplicationI>;

    constructor() {
        this.repository = AppDataSource.getRepository(ApplicationEntitySchema);
    }
    async query(queryString: string, parameters?: any[]): Promise<any> {
        return this.repository.query(queryString, parameters);
    }
    async create(data: Partial<ApplicationI>): Promise<ApplicationI> {
        const application = this.repository.create(data);
        return await this.repository.save(application);
    }

    async findById(id: string): Promise<ApplicationI | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async findByIdWithRelations(id: string): Promise<ApplicationI | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['candidate', 'opportunity'],
        });
    }

    async findAll(): Promise<ApplicationI[]> {
        return await this.repository.find();
    }

    async update(id: string, update: Partial<ApplicationI>): Promise<ApplicationI | null> {
        const application = await this.findById(id);
        if (!application) return null;
        Object.assign(application, update);
        return await this.repository.save(application);
    }
    async updateStatus(applicationId: string, status: ApplicationStatus) {
        await this.repository.update({ id: applicationId }, { status });
        return this.repository.findOne({ where: { id: applicationId } });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }
    async deleteByOpportunityId(opportunityId: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .delete()
            .from(ApplicationEntitySchema)
            .where('opportunityId = :opportunityId', { opportunityId })
            .execute();
    }

    async save(application: ApplicationI): Promise<ApplicationI> {
        return await this.repository.save(application);
    }

    async findByCandidateId(candidateId: string): Promise<ApplicationI[]> {
        return await this.repository.find({
            where: { candidate: { id: candidateId } },
            relations: ['opportunity', 'candidate'],
            order: { applicationDate: 'DESC' },
        });
    }
    async findExistingApplication(candidateId: string, opportunityId: string): Promise<ApplicationI | null> {
        return await this.repository.findOne({
            where: {
                candidate: { id: candidateId },
                opportunity: { id: opportunityId },
            },
        });
    }
    async countByCandidate(candidateId: string) {
        return this.repository.count({ where: { candidate: { id: candidateId } } });
    }
    async findByCandidatePaginated(
        candidateId: string,
        page = 1,
        limit = 10,
        filters: {
            status?: string;
            searchTitle?: string;
            searchNote?: string;
            applicationDate?: {
                startDate: string;
                endDate: string;
            };
        } = {},
    ): Promise<[ApplicationI[], number]> {
        const query = this.repository
            .createQueryBuilder('application')
            .leftJoinAndSelect('application.opportunity', 'opportunity')
            .leftJoinAndSelect('opportunity.createdBy', 'recruiter')
            .leftJoinAndSelect('application.candidate', 'candidate')
            .where('candidate.id = :candidateId', { candidateId });

        if (filters.status) {
            query.andWhere('application.status = :status', { status: filters.status });
        }

        if (filters.searchTitle) {
            query.andWhere(`LOWER(opportunity."OpportunityVersions"::jsonb->0->>'title') LIKE LOWER(:searchTitle)`, {
                searchTitle: `%${filters.searchTitle}%`,
            });
        }

        if (filters.searchNote) {
            query.andWhere(`LOWER(application.note) LIKE LOWER(:searchNote)`, { searchNote: `%${filters.searchNote}%` });
        }

        if (filters.applicationDate?.startDate && filters.applicationDate?.endDate) {
            query.andWhere('DATE(application.applicationDate) BETWEEN :startDate AND :endDate', {
                startDate: filters.applicationDate.startDate,
                endDate: filters.applicationDate.endDate,
            });
        }

        query.orderBy('application.applicationDate', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        return await query.getManyAndCount();
    }

    async getJobsWithApplicationsPaginated(filters: {
        pageNumber: number;
        pageSize: number;
        applicationPageSize: number;
        jobTitleFilter?: string;
        locationFilter?: string;
        applicationStatus?: string;
        applicationDateStart?: string;
        applicationDateEnd?: string;
        hasCvVideo?: boolean;
        industryFilter?: string;
        ownerId?: string;
        onlyOpenJobs?: boolean;
    }) {
        const {
            pageNumber,
            pageSize,
            jobTitleFilter,
            locationFilter,
            applicationStatus,
            applicationDateStart,
            applicationDateEnd,
            hasCvVideo,
            industryFilter,
            ownerId,
            onlyOpenJobs,
        } = filters;

        const offset = (pageNumber - 1) * pageSize;
        const filterConditions: string[] = [];
        const queryParams: any[] = [];

        if (ownerId) {
            queryParams.push(ownerId);
            filterConditions.push(`o."createdById" = $${queryParams.length}`);
        }

        if (jobTitleFilter) {
            queryParams.push(`%${jobTitleFilter}%`);
            filterConditions.push(`(o."OpportunityVersions"->0->>'title') ILIKE $${queryParams.length}`);
        }

        if (locationFilter) {
            queryParams.push(`%${locationFilter}%`);
            filterConditions.push(`(o.country::text ILIKE $${queryParams.length} OR o.city->>'name' ILIKE $${queryParams.length})`);
        }

        if (industryFilter) {
            queryParams.push(industryFilter);
            filterConditions.push(`o.industry = $${queryParams.length}`);
        }

        if (applicationStatus) {
            queryParams.push(applicationStatus);
            filterConditions.push(`
      EXISTS (
        SELECT 1 FROM applications a
        WHERE a."opportunityId" = o.id AND o.status = $${queryParams.length}
      )
    `);
        }

        if (applicationDateStart && applicationDateEnd) {
            queryParams.push(applicationDateStart);
            queryParams.push(applicationDateEnd);
            filterConditions.push(`
      EXISTS (
        SELECT 1 FROM applications a
        WHERE a."opportunityId" = o.id
        AND a."applicationDate" >= $${queryParams.length - 1}
        AND a."applicationDate" < ($${queryParams.length}::date + interval '1 day')
      )
    `);
        }
        if (hasCvVideo) {
            filterConditions.push(`
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a."opportunityId" = o.id
        AND trim(coalesce(a."cvvideo", '')) <> ''
    )
  `);
        }
        if (onlyOpenJobs) {
            filterConditions.push(`o.status NOT IN ('Filled', 'Expired')`);
        }

        queryParams.push(pageSize);
        const limitIndex = queryParams.length;
        queryParams.push(offset);
        const offsetIndex = queryParams.length;

        const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(' AND ')}` : '';
        console.log('[repo] whereClauseRaw =', whereClause);
        console.log('[repo] queryParams BEFORE limit/offset =', queryParams);

        const jobsRaw = await this.repository.query(
            `
    SELECT DISTINCT (o."OpportunityVersions"->0->>'title') AS job_title,
           o.id AS "opportunityId",
           o.status,
           o.industry,
           o.country,
           o.city->>'name' AS city
    FROM opportunity o
    ${whereClause}
    ORDER BY job_title
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `,
            queryParams,
        );
        console.log(
            '[repo] Final jobs query with params:',
            `
SELECT DISTINCT (o."OpportunityVersions"->0->>'title') AS job_title,
       o.id AS "opportunityId",
       o.status,
       o.industry,
       o.country,
       o.city->>'name' AS city
FROM opportunity o
${whereClause}
ORDER BY job_title
LIMIT $${limitIndex} OFFSET $${offsetIndex}
`,
        );
        console.log('[repo] final queryParams:', queryParams);

        const totalJobsRaw = await this.repository.query(
            `
    SELECT COUNT(DISTINCT (o."OpportunityVersions"->0->>'title')) AS total
    FROM opportunity o
    ${whereClause}
    `,
            queryParams.slice(0, queryParams.length - 2),
        );

        const totalJobs = Number(totalJobsRaw[0]?.total || 0);

        return {
            jobsRaw,
            totalJobs,
        };
    }

    async countByCandidateAndStatus(candidateId: string, status: ApplicationStatus): Promise<number> {
        return this.repository.count({
            where: {
                candidate: { id: candidateId },
                status,
            },
        });
    }

    async countByCandidateInDateRange(candidateId: string, from: Date, to: Date) {
        return this.repository.count({
            where: {
                candidate: { id: candidateId },
                applicationDate: Between(from, to),
            },
        });
    }
    async countByCandidateInDateRangeAndStatus(candidateId: string, from: Date, to: Date, status: ApplicationStatus): Promise<number> {
        return this.repository.count({
            where: {
                candidate: { id: candidateId },
                applicationDate: Between(from, to),
                status,
            },
        });
    }
    async findCandidatesByOpportunityWithFilters(
        opportunityId: string,
        pageNumber: number,
        pageSize: number,
        filters: {
            interest?: InterestStatus;
            hasCvVideo?: boolean;
            searchTerm?: string;
            excludeScheduled?: boolean;
        },
    ) {
        const qb = this.repository
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.candidate', 'cand')
            .where('app.opportunityId = :oppId', { oppId: opportunityId });

        if (filters.interest) {
            qb.andWhere('app.interest = :interest', { interest: filters.interest });
        }

        if (filters.hasCvVideo) {
            qb.andWhere("cand.cvVideoUrl IS NOT NULL AND cand.cvVideoUrl != ''");
        }

        if (filters.searchTerm) {
            const term = `%${filters.searchTerm.toLowerCase()}%`;
            qb.andWhere(`(LOWER(cand.fullName) LIKE :term OR LOWER(cand.email) LIKE :term)`, { term });
        }

        if (filters.excludeScheduled) {
            qb.andWhere(qb2 => {
                const subQuery = qb2
                    .subQuery()
                    .select('1')
                    .from('interviews', 'i')
                    .where('i.candidateId = app.candidateId')
                    .andWhere('i.opportunityId = app.opportunityId')
                    .andWhere("i.status != 'cancelled'")
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            });
        }

        qb.orderBy('app.applicationDate', 'DESC')
            .skip((pageNumber - 1) * pageSize)
            .take(pageSize);

        return qb.getManyAndCount();
    }

    public async getAll(queries: any): Promise<{ applications: ApplicationI[]; total: number }> {
        const { recruiterId, pageNumber = 1, pageSize = 10 } = queries;

        const qb = this.repository
            .createQueryBuilder('application')
            .leftJoinAndSelect('application.opportunity', 'opportunity')
            .leftJoinAndSelect('application.candidate', 'candidate')
            .where('opportunity."createdById" = :recruiterId', { recruiterId })
            .andWhere('application.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['Accepted', 'Rejected'] })
            .skip((pageNumber - 1) * pageSize)
            .take(pageSize)
            .orderBy('application.applicationDate', 'DESC');

        const [applications, total] = await qb.getManyAndCount();

        return { applications, total };
    }
}
