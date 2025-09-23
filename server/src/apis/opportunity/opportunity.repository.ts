import { AppDataSource } from '@/utils/databases';
import { Repository } from 'typeorm';
import { Opportunity } from './opportunity.interfaces';
import { OpportunityEntitySchema } from './opportunity.schema';

export class OpportunityRepository {
    public repository: Repository<Opportunity>;

    constructor() {
        this.repository = AppDataSource.getRepository(OpportunityEntitySchema);
    }
    async query(queryString: string, parameters?: any[]): Promise<any> {
        return this.repository.query(queryString, parameters);
    }
    async findOne(conditions: any): Promise<Opportunity | null> {
        return await this.repository.findOne({ where: conditions });
    }

    async findByReference(reference: string): Promise<Opportunity | null> {
        return await this.repository.findOne({ where: { reference } });
    }

    async findById(id: string, extraRelations: string[] = []): Promise<Opportunity | null> {
        const defaultRelations = ['createdBy', 'applicants'];
        const allRelations = Array.from(new Set([...defaultRelations, ...extraRelations]));

        return this.repository.findOne({
            where: { id },
            relations: allRelations,
        });
    }
    private buildFilterQuery(filters: Record<string, any>) {
        const {
            country,
            industry,
            opportunityType,
            minExperience,
            maxExperience,
            contractType,
            city,
            workMode,
            employmentType,
            isPublished,
            urgent,
            title,
            orderBy = 'createdAt',
            orderDirection = 'DESC',
            limit = 10,
            offset = 0,
            status,
            visibility,
            isArchived,
        } = filters;

        const query = this.repository
            .createQueryBuilder('opportunity')
            .leftJoinAndSelect('opportunity.createdBy', 'createdBy')
            .leftJoinAndSelect('opportunity.applicants', 'applicants');

        if (filters.createdBy) {
            query.andWhere('opportunity.createdBy = :createdBy', { createdBy: filters.createdBy });
        }

        if (country) query.andWhere('opportunity.country = :country', { country });

        if (industry) {
            if (Array.isArray(industry)) {
                query.andWhere('opportunity.industry IN (:...industries)', { industries: industry });
            } else {
                query.andWhere('opportunity.industry = :industry', { industry });
            }
        }

        if (opportunityType) query.andWhere('opportunity.opportunityType = :opportunityType', { opportunityType });

        if (minExperience !== undefined) query.andWhere('opportunity.minExperience >= :minExperience', { minExperience });

        if (maxExperience !== undefined) query.andWhere('opportunity.maxExperience <= :maxExperience', { maxExperience });

        if (contractType) {
            if (Array.isArray(contractType)) {
                query.andWhere('opportunity.contractType IN (:...contractTypes)', { contractTypes: contractType });
            } else {
                query.andWhere('opportunity.contractType = :contractType', { contractType });
            }
        }

        if (city) query.andWhere("LOWER(opportunity.city->>'name') LIKE LOWER(:city)", { city: `%${city}%` });

        if (workMode) query.andWhere('opportunity.workMode = :workMode', { workMode });

        if (employmentType) {
            if (Array.isArray(employmentType)) {
                query.andWhere('opportunity.employmentType IN (:...employmentTypes)', {
                    employmentTypes: employmentType,
                });
            } else {
                query.andWhere('opportunity.employmentType = :employmentType', { employmentType });
            }
        }

        if (isPublished !== undefined) query.andWhere('opportunity.isPublished = :isPublished', { isPublished });

        if (urgent !== undefined) query.andWhere('opportunity.urgent = :urgent', { urgent });

        if (visibility)
            query.andWhere(`LOWER(opportunity."OpportunityVersions"::jsonb->0->>'visibility') = LOWER(:visibility)`, {
                visibility,
            });

        if (title)
            query.andWhere('LOWER(opportunity."OpportunityVersions"::jsonb->0->>\'title\') LIKE LOWER(:title)', {
                title: `%${title}%`,
            });

        if (status) query.andWhere('opportunity.status = :status', { status });

        if (isArchived === undefined) {
            query.andWhere(`LOWER(opportunity."OpportunityVersions"::jsonb->0->>'isArchived') = LOWER(:defaultArchived)`, {
                defaultArchived: 'false',
            });
        } else {
            query.andWhere(`LOWER(opportunity."OpportunityVersions"::jsonb->0->>'isArchived') = LOWER(:isArchived)`, {
                isArchived: String(isArchived),
            });
        }

        query.orderBy(`opportunity.${orderBy}`, orderDirection);
        query.skip(offset).take(limit);
        query.distinct(true);

        return query;
    }
    async filter(filters: Record<string, any>): Promise<Opportunity[]> {
        const query = this.buildFilterQuery(filters);
        return await query.getMany();
    }
    async filterWithCount(filters: Record<string, any>): Promise<[Opportunity[], number]> {
        const query = this.buildFilterQuery(filters);
        return await query.getManyAndCount();
    }

    async findAll(query: Partial<Record<keyof Opportunity, any>>): Promise<Opportunity[]> {
        return await this.repository.find({
            where: query,
            relations: ['createdBy', 'applicants'],
        });
    }

    async create(data: Partial<Opportunity>): Promise<Opportunity> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async update(opportunity: Opportunity): Promise<Opportunity> {
        return await this.repository.save(opportunity);
    }
    async updateById(id: string, partial: Partial<Opportunity>): Promise<Opportunity | null> {
        await this.repository.update(id, partial); 
        return this.findById(id); 
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async save(opportunity: Opportunity): Promise<Opportunity> {
        return await this.repository.save(opportunity);
    }

    async findByIdAndUpdate(id: string, update: Partial<Opportunity>): Promise<Opportunity | null> {
        const entity = await this.findById(id);
        if (!entity) return null;
        Object.assign(entity, update);
        return await this.repository.save(entity);
    }
    async findWithPaginationByCreator(userId: string, limit: number, offset: number): Promise<[Opportunity[], number]> {
        const query = this.repository
            .createQueryBuilder('opportunity')
            .leftJoinAndSelect('opportunity.createdBy', 'createdBy')
            .leftJoinAndSelect('opportunity.applicants', 'applicants')
            .where('createdBy.id = :userId', { userId })
            .orderBy('opportunity.createdAt', 'DESC')
            .skip(offset)
            .take(limit);

        const [result, total] = await query.getManyAndCount();
        return [result, total];
    }
}
