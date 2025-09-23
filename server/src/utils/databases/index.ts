import { DataSource } from 'typeorm';
import { logger } from '../logger';
import { BaseUserEntitySchema } from '@/apis/user/schemas/base-user.schema';
import { CandidateEntitySchema } from '@/apis/user/schemas/candidate.schema';
import { MessageEntitySchema, SeenMessageEntitySchema } from '@/apis/messages/messages.model';
import { RecruiterEntitySchema } from '@/apis/user/schemas/recruiter.schema';
import { OpportunityEntitySchema } from '@/apis/opportunity/opportunity.schema';
import { FileEntitySchema } from '@/apis/storage/files.model';
import { ApplicationEntitySchema } from '@/apis/application/application.schema';
import { GroupEntitySchema } from '@/apis/messages/groups/groups.model';
import { NotificationEntitySchema } from '@/apis/notifications/notification.model';
import { CandidateSubscriber } from '../helpers/candidate.subscriber';
import { InterviewEntitySchema } from '@/apis/interviews/interviews.schema';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [
        MessageEntitySchema,
        GroupEntitySchema,
        BaseUserEntitySchema,
        RecruiterEntitySchema,
        CandidateEntitySchema,
        OpportunityEntitySchema,
        FileEntitySchema,
        ApplicationEntitySchema,
        SeenMessageEntitySchema,
        NotificationEntitySchema,
        InterviewEntitySchema
    ],
    // migrations: [],
    // subscribers: [],
    subscribers: [CandidateSubscriber],
});

export const postgresConnect = async (): Promise<void> => {
    try {
        //
        if (AppDataSource.isInitialized) {
            logger.info('Postgres already connected');
            return;
        }
        //
        await AppDataSource.initialize();
        logger.info('Connected to Postgres');
        logger.info(`Database: ${process.env.DB_NAME}`);
    } catch (error) {
        logger.error(`Postgres not connected: ${error}`);
        process.exit(1);
    }
};

export default { postgresConnect, AppDataSource };