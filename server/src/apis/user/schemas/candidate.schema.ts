import { EntitySchema } from 'typeorm';
import { Role, Industry, candidateStatus } from '@/utils/helpers/constants';
import { BaseUserEntitySchema } from './base-user.schema';
import { CandidateUser } from '../interfaces/candidate.interfaces';

export const CandidateEntitySchema = new EntitySchema<CandidateUser>({
    name: BaseUserEntitySchema.options.name!,
    tableName: BaseUserEntitySchema.options.tableName!,
    discriminatorValue: Role.CANDIDAT,
    columns: {
        ...BaseUserEntitySchema.options.columns,

        targetRole: {
            type: 'text',
            nullable: true,
        },
        skills: {
            type: 'simple-array',
            nullable: true,
        },
        education: {
            type: 'simple-json',
            nullable: true,
        },
        professionalExperience: {
            type: 'simple-json',
            nullable: true,
        },
        certification: {
            type: 'simple-json',
            nullable: true,
        },
        industry: {
            type: 'enum',
            enum: Industry,
            nullable: true,
        },
        languages: {
            type: 'simple-json',
            nullable: true,
        },
        nationalities: {
            type: 'simple-array',
            nullable: true,
        },
        monthsOfExperiences: {
            type: 'int',
            nullable: true,
        },
        numberOfCertifications: {
            type: 'int',
            nullable: true,
        },
        numberOfEducations: {
            type: 'int',
            nullable: true,
        },
        numberOfSkills: {
            type: 'int',
            nullable: true,
        },
        numberOfExperiences: {
            type: 'int',
            nullable: true,
        },
        numberOfLanguages: {
            type: 'int',
            nullable: true,
        },
        summary: {
            type: 'text',
            nullable: true,
        },
        status: {
            type: 'enum',
            enum: candidateStatus,
            default: candidateStatus.New,
        },
        cvUrl: {
            type: 'text',
            nullable: true,
        },
        cvVideoUrl: {
            type: 'text',
            nullable: true,
        },
        profileCompleteness: {
            type: 'int',
            default: 0,
            nullable: false,
        },
    },
    relations: {
        favorites: {
            type: 'many-to-many',
            target: 'Opportunity',
            joinTable: {
                name: 'candidate_favorites',
                joinColumn: {
                    name: 'candidate_id',
                    referencedColumnName: 'id',
                },
                inverseJoinColumn: {
                    name: 'opportunity_id',
                    referencedColumnName: 'id',
                },
            },
            cascade: true,
        },
    },
});
