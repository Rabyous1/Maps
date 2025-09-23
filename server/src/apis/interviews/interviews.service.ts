import { AppDataSource } from '@/utils/databases';
import { Repository } from 'typeorm';
import { Interview } from './interviews.interface';
import { ApplicationEntitySchema } from '@/apis/application/application.schema';
import HttpException from '@/utils/exceptions/http.exception';
import { InterviewRepository } from './interviews.repository';

export class InterviewService {
    private interviewRepo: InterviewRepository;
    private applicationRepo: Repository<any>;

    constructor() {
        this.interviewRepo = new InterviewRepository();
        this.applicationRepo = AppDataSource.getRepository(ApplicationEntitySchema);
    }

    async addInterview(data: {
        applicationId: string;
        date: string;
        durationMinutes: number;
        notes?: string;
        type?: 'video' | 'in-person';
        status?: 'scheduled' | 'completed' | 'cancelled';
        recruiterId: string;
    }): Promise<Interview & { candidateId: string }> {
        const { applicationId, date, durationMinutes, notes, type = 'video', status = 'scheduled', recruiterId } = data;

        const application = await this.applicationRepo.findOne({
            where: { id: applicationId },
            relations: ['candidate', 'opportunity'],
        });

        if (!application) {
            throw new HttpException(404, 'Application not found');
        }

        const candidateId = application.candidate?.id;
        const opportunityId = application.opportunity?.id;

        if (!candidateId || !opportunityId) {
            throw new HttpException(400, 'Application is missing candidateId or opportunityId');
        }

        // --- Availability / conflict check ---
        const newStart = new Date(date);
        if (Number.isNaN(newStart.getTime())) {
            throw new HttpException(400, 'Invalid date provided');
        }
        const newEnd = new Date(newStart.getTime() + durationMinutes * 60 * 1000);

        const bufferMs = 24 * 60 * 60 * 1000;
        const windowStart = new Date(newStart.getTime() - bufferMs);
        const windowEnd = new Date(newEnd.getTime() + bufferMs);

        const existingInterviews = await this.interviewRepo.findByRecruiterBetween(recruiterId, windowStart, windowEnd);

        for (const ex of existingInterviews) {
            // compute existing interval
            const exStart = new Date(ex.date);
            const exEnd = new Date(exStart.getTime() + (ex.durationMinutes ?? 0) * 60 * 1000);

            // overlap check: exStart < newEnd && exEnd > newStart
            if (exStart < newEnd && exEnd > newStart) {
                // found conflict
                throw new HttpException(
                    500,
                    `Recruiter has a conflicting interview scheduled from ${exStart.toISOString()} to ${exEnd.toISOString()}`,
                );
            }
        }

        const interview = this.interviewRepo.repository.create({
            candidateId,
            applicationId,
            opportunityId,
            recruiterId,
            date,
            durationMinutes,
            notes,
            type,
            status,
        });

        const savedInterview = await this.interviewRepo.repository.save(interview);

        return {
            ...savedInterview,
            candidateId,
        };
    }

    async getInterviewsByRecruiter(recruiterId: string) {
        const availableRelations = this.interviewRepo.repository.metadata.relations.map(r => r.propertyName);
        const wanted = ['candidate', 'recruiter', 'application', 'opportunity'];
        const relationsToLoad = wanted.filter(r => availableRelations.includes(r));

        return await this.interviewRepo.repository.find({
            where: { recruiterId },
            relations: relationsToLoad,
            order: { date: 'ASC' },
        });
    }

    async deleteInterview(id: string, recruiterId: string): Promise<boolean> {
        const interview = await this.interviewRepo.repository.findOne({ where: { id, recruiterId } });

        if (!interview) return false;

        const deleted = await this.interviewRepo.repository.delete(id);
        if (!deleted.affected) return false;

        return true;
    }

    async getInterviewById(id: string): Promise<Interview | null> {
        return this.interviewRepo.repository.findOne({
            where: { id },
            relations: ['candidate', 'recruiter', 'opportunity'],
        });
    }
    public async updateInterview(id: string, data: Partial<Interview>) {
        return this.interviewRepo.update(id, data);
    }
    public async getInterviewsByCandidate(candidateId: string, queries: any) {
        const pageNumber = Number(queries.pageNumber) || 1;
        const pageSize = Number(queries.pageSize) || 10;

        const [interviews, total] = await this.interviewRepo.repository.findAndCount({
            where: { candidateId },
            relations: ['recruiter', 'opportunity'],
            order: { date: 'ASC' },
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
        });

        const mappedInterviews = interviews.map(interview => {
            const opportunityTitle = interview.opportunity?.OpportunityVersions?.[0]?.title || '-';
            const { opportunity, ...rest } = interview;
            return {
                ...rest,
                opportunityTitle,
            };
        });

        return {
            pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            totalInterviews: total,
            interviews: mappedInterviews,
        };
    }
}
