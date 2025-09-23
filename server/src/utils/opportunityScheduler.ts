
import cron from 'node-cron';
import { LessThanOrEqual } from 'typeorm';
import { AppDataSource } from './databases';
import { OpportunityEntitySchema } from '@/apis/opportunity/opportunity.schema';

export function startOpportunityScheduler() {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const opportunityRepo = AppDataSource.getRepository(OpportunityEntitySchema);

    const opportunitiesToPublish = await opportunityRepo.find({
      where: {
        isPublished: false,
        publishAt: LessThanOrEqual(now),
      },
    });

    for (const opp of opportunitiesToPublish) {
      opp.isPublished = true;
      await opportunityRepo.save(opp);
      console.log(`Opportunity ${opp.id} has been published automatically`);
    }
  });

  console.log('⏰ Opportunity publication scheduler is running every minute.');
}
