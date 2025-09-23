import { EntitySchema } from 'typeorm';
import { Industry, JobStatus, OpportunityType, Countries, Source, WorkMode, EmploymentType, ContractType } from '@/utils/helpers/constants';
import { Opportunity } from './opportunity.interfaces';

export const OpportunityEntitySchema = new EntitySchema<Opportunity>({
    name: 'Opportunity',
    tableName: 'opportunity',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
        },
        reference: {
            type: 'varchar',
            unique: true,
        },
        isPublished: {
            type: 'boolean',
            default: false,
        },
        publishAt: {
            type: 'timestamp',
            createDate: true,
            nullable: true,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
        },
        dateOfExpiration: {
            type: 'timestamp',
            nullable: true,
        },
        status: {
            type: 'enum',
            enum: JobStatus,
            default: JobStatus.ACTIVE,
        },
        opportunityType: {
            type: 'enum',
            enum: OpportunityType,
        },
        industry: {
            type: 'enum',
            enum: Industry,
        },
        urgent: {
            type: 'boolean',
            default: false,
        },
        country: {
            type: 'enum',
            enum: Countries,
        },
        contractType: {
            type: 'enum',
            enum: ContractType,
            default: ContractType.FIXED_TERM,
        },
        minExperience: {
            type: 'int',
        },
        maxExperience: {
            type: 'int',
        },
        salaryMinimum: {
            type: 'varchar',
            nullable: true,
        },
        source: {
            type: 'enum',
            enum: Source,
            nullable: true,
        },
        workMode: {
            type: 'enum',
            enum: WorkMode,
            nullable: true,
        },
        employmentType: {
            type: 'enum',
            enum: EmploymentType,
            nullable: true,
        },
        OpportunityVersions: {
            type: 'jsonb',
            nullable: false,
        },
        city: {
            type: 'jsonb',
            nullable: true,
        },
    },
    relations: {
        applicants: {
            type: 'many-to-many',
            target: 'User',
            joinTable: {
                name: 'opportunity_applicants',
                joinColumn: {
                    name: 'opportunity_id',
                    referencedColumnName: 'id',
                },
                inverseJoinColumn: {
                    name: 'user_id',
                    referencedColumnName: 'id',
                },
            },
            cascade: true,
            eager: false,
        },
        createdBy: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: true,
        },
    },
});
