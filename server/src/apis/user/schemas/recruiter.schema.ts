import { EntitySchema } from 'typeorm';
import { Role, LegalStatus } from '@/utils/helpers/constants';
import { BaseUserEntitySchema } from './base-user.schema';
import { RecruiterUser } from '../interfaces/recruiter.interfaces';

export const RecruiterEntitySchema = new EntitySchema<RecruiterUser>({
  name:               BaseUserEntitySchema.options.name!,
  tableName:          BaseUserEntitySchema.options.tableName!,
  discriminatorValue: Role.RECRUTEUR,
  columns: {
    position: { type: 'varchar', nullable: true },
    department: { type: 'varchar', nullable: true },
    companyName: { type: 'varchar', nullable: true },
    companyWebsite: { type: 'varchar', nullable: true },
    companySize: { type: 'varchar', nullable: true },
    recruiterSummary: { type: 'text', nullable: true },
    legalStatus: { type: 'enum', enum: LegalStatus, nullable: true },
    fiscalNumber: { type: 'varchar', nullable: true },
    currentCompany: { type: 'varchar', nullable: true },
  },
});

