import { AppDataSource } from '@/utils/databases';
import { Between, Repository } from 'typeorm';
import { Interview } from './interviews.interface';
import { InterviewEntitySchema } from './interviews.schema';

export class InterviewRepository {
    public repository: Repository<Interview>;

    constructor() {
        this.repository = AppDataSource.getRepository(InterviewEntitySchema);
    }

    async create(data: Partial<Interview>): Promise<Interview> {
        const interview = this.repository.create(data);
        return this.repository.save(interview);
    }

    async findById(id: string): Promise<Interview | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['candidate', 'recruiter', 'opportunity'],
        });
    }

    async findByCandidate(candidateId: string): Promise<Interview[]> {
        return this.repository.find({
            where: { candidateId },
            relations: ['candidate', 'recruiter', 'opportunity'],
            order: { date: 'ASC' },
        });
    }

    async update(id: string, data: Partial<Interview>): Promise<Interview | null> {
        const interview = await this.findById(id);
        if (!interview) return null;
        Object.assign(interview, data);
        return this.repository.save(interview);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
    async findByRecruiterBetween(recruiterId: string, from: Date, to: Date): Promise<Interview[]> {
        return this.repository.find({
            where: {
                recruiterId,
                date: Between(from, to) as unknown as string,
            },
            relations: ['candidate', 'recruiter', 'opportunity'],
            order: { date: 'ASC' },
        });
    }
}
