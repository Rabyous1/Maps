import cron from 'node-cron';
import { LessThanOrEqual } from 'typeorm';
import { InterviewEntitySchema } from '@/apis/interviews/interviews.schema';
import { AppDataSource } from '../databases';

export function startInterviewScheduler() {
    cron.schedule('0 0 * * *', async () => {
        // runs every day at midnight
        const now = new Date().toISOString();
        const interviewRepo = AppDataSource.getRepository(InterviewEntitySchema);

        const scheduledInterviews = await interviewRepo.find({
            where: {
                date: LessThanOrEqual(now),
                status: 'scheduled', 
            },
        });

        for (const interview of scheduledInterviews) {
            interview.status = 'missed';
            await interviewRepo.save(interview);
            console.log(`Interview ${interview.id} marked as MISSED automatically`);
        }
    });

    console.log('⏰ Interview scheduler is running daily at midnight.');
}
