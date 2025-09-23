import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { OpportunityEntitySchema } from '@/apis/opportunity/opportunity.schema';
import { publishOpportunityJob } from './publish-opportunity.job';
import { AppDataSource } from '../databases';
import { JobStatus } from '@/utils/helpers/constants';
import cron from 'node-cron'; // ✅ Ajout ici

export const schedulePendingOpportunities = async () => {
  const repo = AppDataSource.getRepository(OpportunityEntitySchema);
  const now = new Date();

  console.log('[StartupJobs] Vérification des opportunités à publier...');

  // 📌 Opportunités déjà dépassées mais non publiées → publier maintenant
  const toPublishNow = await repo.find({
    where: {
      isPublished: false,
      publishAt: LessThanOrEqual(now),
    },
  });

  for (const opp of toPublishNow) {
    const hasDraftVisibility = opp.OpportunityVersions?.some(v => v.visibility === 'Draft');

    if (hasDraftVisibility) {
      console.log(`[StartupJobs] ⚠️ Opportunité ID ${opp.id} NON publiée car en mode brouillon.`);
      continue;
    }

    opp.isPublished = true;
    await repo.save(opp);
    console.log(`[StartupJobs] ✅ Opportunité ID ${opp.id} publiée immédiatement (retard de planification).`);
  }

  // 📌 Opportunités à planifier dans le futur
  const toSchedule = await repo.find({
    where: {
      isPublished: false,
      publishAt: MoreThanOrEqual(now),
    },
  });

  for (const opp of toSchedule) {
    if (opp.id && opp.publishAt) {
      console.log(`[StartupJobs] ⏳ Planification de l’opportunité ID ${opp.id} pour ${opp.publishAt}`);
      await publishOpportunityJob.schedule(opp.id, opp.publishAt);
    }
  }

  // 📌 Opportunités expirées → mettre à jour leur statut
  const expiredOpportunities = await repo.find({
    where: {
      dateOfExpiration: LessThanOrEqual(now),
      status: JobStatus.ACTIVE,
    },
  });

  for (const opp of expiredOpportunities) {
    opp.status = JobStatus.EXPIRED;
    await repo.save(opp);
    console.log(`[StartupJobs] ❌ Opportunité ID ${opp.id} expirée → statut mis à jour.`);
  }

  console.log('[StartupJobs] ✅ Vérifications de publication et d’expiration terminées.');
};

// ✅ Lancement automatique toutes les 6 heures
cron.schedule('0 */6 * * *', async () => {
  console.log('[CRON] ⏰ Lancement automatique du job de publication/expiration...');
  await schedulePendingOpportunities();
});
