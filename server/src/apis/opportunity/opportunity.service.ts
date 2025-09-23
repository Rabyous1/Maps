import { OpportunityRepository } from './opportunity.repository';
import { Opportunity, OpportunityVersion } from './opportunity.interfaces';
import { AppDataSource } from '@/utils/databases';
import { loadCities } from '@/utils/helpers/loadCities';
import { OpportunityEntitySchema } from './opportunity.schema';
import { UserRepository } from '../user/UserRepository';
import { CandidateUser } from '../user/interfaces/candidate.interfaces';
import { publishOpportunityJob } from '@/utils/jobs/publish-opportunity.job';
import { filterOpportunitySchema } from './opportunity.validations';
import { ApplicationRepository } from '../application/application.repository';
import HttpException from '@/utils/exceptions/http.exception';

export default class OpportunityService {
    private opportunityRepository = new OpportunityRepository();
    private applicationRepository = new ApplicationRepository();
    private userRepo = new UserRepository();

    async create(input: Partial<Opportunity>, userId: string): Promise<Opportunity> {
        let reference = '';
        let exists = true;

        while (exists) {
            const randomHex = Math.floor(Math.random() * 0xfffff)
                .toString(16)
                .padStart(5, '0');
            reference = `M-${randomHex.toUpperCase()}`;
            exists = (await this.opportunityRepository.findByReference(reference)) !== null;
        }

        const versionsInput = input.OpportunityVersions;
        if (!Array.isArray(versionsInput) || versionsInput.length === 0) {
            throw new HttpException(404, 'At least one OpportunityVersion is required.');
        }

        const completedVersions: OpportunityVersion[] = versionsInput.map(version => {
            const baseSlug = version.title.toLowerCase().replace(/\s+/g, '-');
            const url = `${baseSlug}-${reference}`;
            return {
                ...version,
                isArchived: version.isArchived ?? false,
                visibility: version.visibility ?? 'Public',
                url,
                alt: url,
                metaTitle: `Apply now for the ${version.title}`,
                metaDescription: `Explore the ${version.title}`,
            };
        });

        let selectedCity: { name: string; lat: number; lng: number } | undefined;

        if (input.city?.name && input.country) {
            const allCities = await loadCities();
            const found = allCities.find(city => city.country === input.country && city.city.toLowerCase() === input.city?.name?.toLowerCase());
            if (found) {
                selectedCity = {
                    name: found.city,
                    lat: found.lat,
                    lng: found.lng,
                };
            }
        }

        const hasDraftVisibility = completedVersions.some(v => v.visibility === 'Draft');

        const publishAt = hasDraftVisibility ? null : input.publishAt ? new Date(input.publishAt) : new Date();
        // const publishAt = !hasDraftVisibility ? (input.publishAt ? new Date(input.publishAt + 'T00:00:00Z') : new Date()) : null;


        const isPublishedNow = !hasDraftVisibility && (!publishAt || publishAt <= new Date());

        const opportunity: Partial<Opportunity> = {
            ...input,
            reference,
            OpportunityVersions: completedVersions,
            createdBy: { id: userId } as any,
            city: selectedCity,
            isPublished: isPublishedNow,
            publishAt,
        };

        const createdOpportunity = await this.opportunityRepository.create(opportunity);
        console.log(createdOpportunity);

        if (!hasDraftVisibility && !isPublishedNow && publishAt && createdOpportunity.id) {
            await publishOpportunityJob.schedule(createdOpportunity.id, publishAt);
        }

        return createdOpportunity;
    }

    async getPublished(): Promise<Opportunity[]> {
        return await this.opportunityRepository.findAll({
            isPublished: true,
        });
    }

    async getOpportunitiesByCreatorWithDetails(userId: string, pageNumber = 1, pageSize = 10, filters: Record<string, any> = {}): Promise<any> {
        const offset = (pageNumber - 1) * pageSize;
        const now = new Date();

        const mergedFilters = {
            ...filters,
            createdBy: userId,
            limit: pageSize,
            offset,
        };

        const { value, error } = filterOpportunitySchema.validate(mergedFilters);
        if (error) {
            throw new HttpException(404, `Invalid filters: ${error.message}`);
        }

        const [opportunities, total] = await this.opportunityRepository.filterWithCount(value);

        const transformed = opportunities.map(opp => {
            const version = opp.OpportunityVersions?.[0];
            return {
                id: opp.id,
                title: version?.title || 'Untitled',
                reference: opp.reference,
                country: opp.country,
                industry: opp.industry,
                publisheddate: opp.publishAt,
                contractType: opp.contractType,
                employmentType: opp.employmentType,
                visibility: version?.visibility || null,
                dateOfExpiration: opp.dateOfExpiration,
                expired: opp.dateOfExpiration ? new Date(opp.dateOfExpiration) < now : false,
                applicantsNumber: opp.applicants?.length || 0,
                applicantsList: opp.applicants || [],
                workMode: opp.workMode || null,
                status: opp.status,
                isArchived: version?.isArchived,
            };
        });

        return {
            pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            total,
            opportunities: transformed,
        };
    }
    async filterOpportunities(filters: Record<string, any>): Promise<Opportunity[]> {
        const { value, error } = filterOpportunitySchema.validate(filters);
        if (error) {
            throw new HttpException(404, `Invalid filters: ${error.message}`);
        }

        return await this.opportunityRepository.filter(value);
    }

    async getAll(query: any): Promise<Opportunity[]> {
        return await this.opportunityRepository.findAll(query);
    }

    async get(id: string): Promise<any> {
        const opp = await this.opportunityRepository.findById(id);
        if (!opp) throw new HttpException(404, 'Opportunity not found');

        const version = opp.OpportunityVersions?.[0];
        const now = new Date();

        return {
            id: opp.id,
            title: version?.title || 'Untitled',
            reference: opp.reference,
            country: opp.country,
            // city: opp.city?.name,
            city: opp.city,
            industry: opp.industry,
            publisheddate: opp.publishAt,
            contractType: opp.contractType,
            employmentType: opp.employmentType,
            visibility: version?.visibility || null,
            dateOfExpiration: opp.dateOfExpiration,
            expired: opp.dateOfExpiration ? new Date(opp.dateOfExpiration) < now : false,
            applicantsNumber: opp.applicants?.length || 0,
            applicantsList: opp.applicants || [],
            workMode: opp.workMode || null,
            status: opp.status,
            urgent: opp.urgent,
            minExperience: opp.minExperience,
            maxExperience: opp.maxExperience,
            salaryMinimum: opp.salaryMinimum,
            metaDescription: version?.metaDescription,
            jobDescription: version?.jobDescription,
            opportunityType: opp.opportunityType,
            isArchived: version?.isArchived,
        };
    }

    async update(id: string, data: Partial<Opportunity>, userId: string): Promise<Opportunity | null> {
        const existing = await this.opportunityRepository.findById(id);
        if (!existing) return null;

        if (existing.createdBy.id !== userId) {
            throw new Error('Forbidden: you can only update your own opportunities');
        }

        if (Array.isArray(data.OpportunityVersions)) {
            existing.OpportunityVersions = data.OpportunityVersions.map(version => {
                const baseSlug = version.title.toLowerCase().replace(/\s+/g, '-');
                const url = `${baseSlug}-${existing.reference}`;
                return {
                    ...version,
                    isArchived: version.isArchived ?? false,
                    url,
                    alt: url,
                    metaTitle: `Apply now for the ${version.title}`,
                    metaDescription: `Explore the ${version.title}`,
                };
            });
        }

        const { OpportunityVersions, createdBy, applicants, id: _, ...other } = data;
        Object.assign(existing, other);

        return this.opportunityRepository.save(existing);
    }

    async delete(id: string): Promise<void> {
        await this.applicationRepository.deleteByOpportunityId(id);
        await this.opportunityRepository.delete(id);
    }

    async recover(id: string): Promise<Opportunity | null> {
        return await this.opportunityRepository.findByIdAndUpdate(id, { isPublished: false });
    }

    async addToFavorites(candidateId: string, opportunityId: string): Promise<CandidateUser> {
        const candidateRepository = AppDataSource.getRepository<CandidateUser>('User');
        const opportunityRepository = AppDataSource.getRepository(OpportunityEntitySchema);

        const candidate = await candidateRepository.findOne({
            where: { id: candidateId },
            relations: ['favorites'],
        });

        if (!candidate) {
            throw new HttpException(404, `Candidat not found`);
        }

        const opportunity = await opportunityRepository.findOne({
            where: { id: opportunityId },
        });

        if (!opportunity) {
            throw new HttpException(404, 'Opportunity not found');
        }

        if (!candidate.favorites) {
            candidate.favorites = [];
        }

        const alreadyFavorited = candidate.favorites.some(fav => fav.id === opportunity.id);
        if (!alreadyFavorited) {
            candidate.favorites.push(opportunity);
            await candidateRepository.save(candidate);
        }

        return candidate;
    }

    public async getFavoriteOpportunities(
        candidateId: string,
        queries: { pageNumber?: string; pageSize?: string; paginated?: string },
    ): Promise<any> {
        const pageNumber = Number(queries.pageNumber) || 1;
        const pageSize = Number(queries.pageSize) || 10;
        const isPaginated = queries.paginated !== 'false';

        const candidate = (await this.userRepo.findByIdWithRelations(candidateId, ['favorites'])) as CandidateUser;
        const allFavorites = candidate?.favorites || [];
        const totalFavorites = allFavorites.length;

        const now = new Date();
        const mappedFavorites = allFavorites.map(opp => {
            const firstVersion = opp.OpportunityVersions?.[0];
            const companyName = (opp.createdBy as any)?.companyName || null;
            return {
                id: opp.id,
                reference: opp.reference,
                isPublished: opp.isPublished,
                publishAt: opp.publishAt,
                dateOfExpiration: opp.dateOfExpiration,
                expired: opp.dateOfExpiration ? new Date(opp.dateOfExpiration) < now : false,
                status: opp.status,
                opportunityType: opp.opportunityType,
                industry: opp.industry,
                urgent: opp.urgent,
                country: opp.country,
                contractType: opp.contractType,
                minExperience: opp.minExperience,
                maxExperience: opp.maxExperience,
                salaryMinimum: opp.salaryMinimum,
                source: opp.source,
                workMode: opp.workMode,
                employmentType: opp.employmentType,
                title: firstVersion?.title || null,
                company: companyName,
            };
        });

        if (isPaginated) {
            const totalPages = Math.ceil(totalFavorites / pageSize);
            const start = (pageNumber - 1) * pageSize;
            const end = start + pageSize;
            const favoritesPage = mappedFavorites.slice(start, end);

            return {
                pageNumber,
                pageSize,
                totalPages,
                totalFavorites,
                favorites: favoritesPage,
            };
        } else {
            return {
                totalFavorites,
                favorites: mappedFavorites,
            };
        }
    }


    async removeFavoriteOpportunity(candidateId: string, opportunityId: string): Promise<void> {
        const candidate = (await this.userRepo.findByIdWithRelations(candidateId, ['favorites'])) as CandidateUser;

        if (!candidate) {
            throw new HttpException(404, `Candidat not found`);
        }

        const isFavorite = candidate.favorites?.some(fav => fav.id === opportunityId);
        if (!isFavorite) {
            throw new HttpException(404, `Opportunity is not in favorites`);
        }

        candidate.favorites = (candidate.favorites ?? []).filter(fav => fav.id !== opportunityId);

        await this.userRepo.save(candidate);
    }

    async archiveOpportunity(opportunityId: string, isArchived: boolean, userId: string): Promise<boolean> {
        const opportunity = await this.opportunityRepository.findOne({
            id: opportunityId,
            createdBy: { id: userId }, // sécurité
        });

        if (!opportunity || !Array.isArray(opportunity.OpportunityVersions) || opportunity.OpportunityVersions.length === 0) {
            return false;
        }

        const versions = [...opportunity.OpportunityVersions];
        const lastIndex = versions.length - 1;

        versions[lastIndex] = {
            ...versions[lastIndex],
            isArchived,
        };

        opportunity.OpportunityVersions = versions;

        await this.opportunityRepository.save(opportunity);
        return true;
    }
}

