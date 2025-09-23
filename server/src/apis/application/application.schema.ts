import { EntitySchema } from 'typeorm';
import { ApplicationI } from './application.entity';
import { InterestStatus } from '@/utils/helpers/constants';

export const ApplicationEntitySchema = new EntitySchema<ApplicationI>({
    name: 'Application',
    tableName: 'applications',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
        },
        status: {
            type: 'varchar',
            default: 'Pending',
        },
        note: {
            type: 'text',
            nullable: true,
        },
        applicationDate: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
        },
        resume: {
            type: 'varchar',
            nullable: true,
        },
         cvvideo: {
          type: 'varchar',
          nullable: true,
        },
        interest: {
            type: 'enum',
            enum: InterestStatus,
            default: InterestStatus.NOT_MENTIONED,
        },
    },
    relations: {
        candidate: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'candidateId' },
            eager: false,
            nullable: false,
        },
        opportunity: {
            type: 'many-to-one',
            target: 'Opportunity',
            joinColumn: { name: 'opportunityId' },
            eager: false,
            nullable: false,
        },
    },
});
