import { OpportunityEntitySchema } from '@/apis/opportunity/opportunity.schema';
import { AppDataSource } from '../databases';

export const publishOpportunityJob = {
    schedule: async (opportunityId: string, date: Date) => {
        const delay = date.getTime() - Date.now();

        if (delay <= 0) {
            console.warn(`[publishOpportunityJob] ❌ Cannot schedule job in the past for ID ${opportunityId}`);
            return;
        }

        console.log(`[publishOpportunityJob] ⏳ Scheduling publish in ${Math.round(delay / 1000)}s for ID ${opportunityId}`);

        setTimeout(async () => {
            console.log(`[publishOpportunityJob] 🚀 Executing publish job for ID ${opportunityId}`);
            const repo = AppDataSource.getRepository(OpportunityEntitySchema);
            const opportunity = await repo.findOne({ where: { id: opportunityId } });

            if (opportunity && !opportunity.isPublished) {
                opportunity.isPublished = true;
                await repo.save(opportunity);
                console.log(`[publishOpportunityJob] ✅ Opportunity ${opportunityId} published at ${new Date().toISOString()}`);
            } else {
                console.log(`[publishOpportunityJob] ⚠️ Opportunity ${opportunityId} already published or not found.`);
            }
        }, delay);
    },
};
