import { EntitySchema } from 'typeorm';
import { Interview } from './interviews.interface';

export const InterviewEntitySchema = new EntitySchema<Interview>({
    name: 'Interview',
    tableName: 'interviews',
    columns: {
        id: { type: 'uuid', primary: true, generated: 'uuid' },
        candidateId: { type: 'uuid' },
        opportunityId: { type: 'uuid' },
        recruiterId: { type: 'uuid', nullable: true }, 
        date: { type: 'timestamp' },
        durationMinutes: { type: 'int' }, 
        type: { type: 'varchar', default: 'video' },
        status: { type: 'varchar', default: 'scheduled' },
        notes: { type: 'text', nullable: true },
        createdAt: { type: 'timestamp', createDate: true },
        updatedAt: { type: 'timestamp', updateDate: true },
    },
    relations: {
        candidate: { type: 'many-to-one', target: 'User', joinColumn: { name: 'candidateId' }, eager: true },
        recruiter: { type: 'many-to-one', target: 'User', joinColumn: { name: 'recruiterId' }, eager: true, nullable: true },
        opportunity: { type: 'many-to-one', target: 'Opportunity', joinColumn: { name: 'opportunityId' }, eager: true },
    },
});
