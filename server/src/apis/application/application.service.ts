import { UserRepository } from './../user/UserRepository';
import { ApplicationRepository } from './application.repository';
import { OpportunityRepository } from '../opportunity/opportunity.repository';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileRepository } from '../storage/files.repository';
import { ApplicationI } from './application.entity';
import { CandidateUser } from '../user/interfaces/candidate.interfaces';
import { computeChecksumFromFilePath } from '@/utils/helpers/functions';
import { ApplicationStatus,InterestStatus, JobStatus } from '@/utils/helpers/constants';
import { sendEmail } from '@/utils/services';
import { FileI } from '../storage/files.interface';
import HttpException from '@/utils/exceptions/http.exception';
import { InterviewRepository } from '../interviews/interviews.repository';

export class ApplicationService {
    constructor(
        private applicationRepo = new ApplicationRepository(),
        private userRepo = new UserRepository(),
        private opportunityRepo = new OpportunityRepository(),
        private fileRepo = new FileRepository(),
        private interviewRepo = new InterviewRepository(),
    ) {}

    // async updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    //     try {
    //         const application = await this.applicationRepo.findByIdWithRelations(applicationId);
    //         if (!application) {
    //             throw new HttpException(404, `Application with ID ${applicationId} not found`);
    //         }

    //         await this.applicationRepo.update(applicationId, { status, updatedAt: new Date() });

    //         if (status === ApplicationStatus.ACCEPTED) {
    //             const opportunityId = application.opportunity?.id;
    //             if (!opportunityId) {
    //                 throw new HttpException(400, `No opportunity linked to application ${applicationId} — cannot mark as FILLED.`);
    //             }

    //             try {
    //                 await this.opportunityRepo.updateById(opportunityId, {
    //                     status: JobStatus.FILLED,
    //                     updatedAt: new Date(),
    //                 });

    //                 console.log(`Opportunity ${opportunityId} marked as FILLED because application ${applicationId} was accepted.`);
    //             } catch (err) {
    //                 console.log(`Error`, err);
    //                 throw new HttpException(500, `Failed to update opportunity ${opportunityId} status to FILLED`);
    //             }
    //         }

    //         return await this.applicationRepo.findByIdWithRelations(applicationId);
    //     } catch (err) {
    //         if (err instanceof HttpException) throw err;
    //         throw new HttpException(500, 'Unexpected error while updating application status');
    //     }
    // }
    async updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
        const application = await this.applicationRepo.findByIdWithRelations(applicationId);

        if (!application) {
            throw new HttpException(404, `Application with ID ${applicationId} not found`);
        }

        await this.applicationRepo.update(applicationId, { status, updatedAt: new Date() });

        if (status === ApplicationStatus.ACCEPTED) {
            const candidateId = application.candidate?.id;
            const opportunityId = application.opportunity?.id;

            if (!candidateId || !opportunityId) {
                throw new HttpException(400, 'Missing candidateId or opportunityId — cannot update related entities');
            }

            await this.opportunityRepo.updateById(opportunityId, {
                status: JobStatus.FILLED,
                updatedAt: new Date(),
            });
            console.log(`Opportunity ${opportunityId} marked as FILLED`);

            const interview = await this.interviewRepo.repository.findOne({
                where: { candidateId, opportunityId },
            });

            if (interview && interview.id) {
                await this.interviewRepo.update(interview.id, {
                    status: 'completed',
                    updatedAt: new Date(),
                });
                console.log(`Interview ${interview.id} marked as COMPLETED`);
            }


        }

        return await this.applicationRepo.findByIdWithRelations(applicationId);
    }

    async findMyApplications(
        candidateId: string,
        page = 1,
        limit = 10,
        filters: {
            status?: string;
            search?: string;
            applicationDate?: {
                startDate: string;
                endDate: string;
            };
        } = {},
    ): Promise<{
        pageNumber: number;
        pageSize: number;
        totalApplications: number;
        totalPages: number;
        applications: any[];
    }> {
        const [applications, total] = await this.applicationRepo.findByCandidatePaginated(candidateId, page, limit, filters);
        const now = new Date();

        const mappedApplications = await Promise.all(
            applications.map(async app => {
                const opp = app.opportunity;
                const firstVersion = opp.OpportunityVersions?.[0];
                const companyName = (opp.createdBy as any)?.companyName || null;

                let resumeDisplayName: string | null = null;
                if (app.resume) {
                    const resumeFileName = app.resume.split('/').pop()!;
                    resumeDisplayName = (await this.fileRepo.findByFileName(resumeFileName))?.fileDisplayName ?? null;
                }

                const resumeVideo: string | null = app.cvvideo ?? null;
                let resumeVideoDisplayName: string | null = null;
                if (resumeVideo) {
                    // const videoFileName = resumeVideo.split('/').pop()!;
                    // console.log('Looking for video file:', resumeVideo);
                    // console.log('Looking for video filename:', resumeVideoDisplayName);
                    // resumeVideoDisplayName = (await this.fileRepo.findByFileName(videoFileName))?.fileDisplayName ?? null;
                    const fileNameWithExt = resumeVideo.split('/').pop(); // "ffcca0c6-b2e6-4d65-a03f-a0cb3e36e463.mp4"
                    const videoUuid = fileNameWithExt?.split('.').shift(); // "ffcca0c6-b2e6-4d65-a03f-a0cb3e36e463"

                    const videoFile = await this.fileRepo.findByUuid(videoUuid!);
                    resumeVideoDisplayName = videoFile?.fileDisplayName ?? null; // <-- pas de const ici

                    console.log(videoUuid, resumeVideoDisplayName, videoFile);
                }

                return {
                    id: app.id,
                    status: app.status,
                    applyDate: app.applicationDate,
                    resume: app.resume,
                    resumeDisplayName,
                    resumeVideo,
                    resumeVideoDisplayName,
                    interest: app.interest,
                    title: firstVersion?.title,
                    country: opp.country,
                    company: companyName,
                    opportunity: {
                        oppId: opp.id,
                        jobDescription: firstVersion?.jobDescription,
                        reference: opp.reference,
                        publishAt: opp.publishAt,
                        dateOfExpiration: opp.dateOfExpiration,
                        expired: opp.dateOfExpiration ? new Date(opp.dateOfExpiration) < now : false,
                        industry: opp.industry,
                        contractType: opp.contractType,
                        workMode: opp.workMode,
                        minExperience: opp.minExperience,
                        maxExperience: opp.maxExperience,
                        salaryMinimum: opp.salaryMinimum,
                        employmentType: opp.employmentType,
                        city: opp.city,
                    },
                };
            }),
        );
        console.log(mappedApplications);

        return {
            pageNumber: page,
            pageSize: limit,
            totalApplications: total,
            totalPages: Math.ceil(total / limit),
            applications: mappedApplications,
        };
    }

    async getCandidateStats(candidateId: string) {
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        const twoWeeksAgo = new Date(oneWeekAgo);
        twoWeeksAgo.setDate(oneWeekAgo.getDate() - 7);

        const statuses = Object.values(ApplicationStatus);

        const counts: any = {};
        const changes: any = {};

        const total = await this.applicationRepo.countByCandidate(candidateId);
        const lastWeekTotal = await this.applicationRepo.countByCandidateInDateRange(candidateId, oneWeekAgo, now);
        const prevWeekTotal = await this.applicationRepo.countByCandidateInDateRange(candidateId, twoWeeksAgo, oneWeekAgo);

        const calcChange = (curr: number, prev: number) => (prev === 0 ? 0 : +(((curr - prev) / prev) * 100).toFixed(1));

        for (const status of statuses) {
            const castedStatus = status as ApplicationStatus;
            const current = await this.applicationRepo.countByCandidateAndStatus(candidateId, castedStatus);
            const last = await this.applicationRepo.countByCandidateInDateRangeAndStatus(candidateId, oneWeekAgo, now, castedStatus);
            const prev = await this.applicationRepo.countByCandidateInDateRangeAndStatus(candidateId, twoWeeksAgo, oneWeekAgo, castedStatus);
            counts[status.toLowerCase()] = current;
            changes[status.toLowerCase()] = calcChange(last, prev);
        }

        return {
            ...counts,
            total,
            changePercentage: {
                jobApplications: calcChange(lastWeekTotal, prevWeekTotal),
                ...changes,
            },
        };
    }

    async getJobsWithApplicationsPaginated(filters: {
        pageNumber: number;
        pageSize: number;
        applicationPageSize: number;
        jobTitleFilter?: string;
        locationFilter?: string;
        applicationStatus?: string;
        applicationDateStart?: string;
        applicationDateEnd?: string;
        hasCvVideo?: boolean;
        industryFilter?: string;
        ownerId?: string;
        onlyOpenJobs?: boolean;
    }) {
        const { jobsRaw, totalJobs } = await this.applicationRepo.getJobsWithApplicationsPaginated(filters);

        const jobs = await Promise.all(
            jobsRaw.map(async (row: { job_title: any; opportunityId: any; status: any; industry: any; country: any; city: any }) => {
                const { job_title: jobTitle, opportunityId, status, industry, country, city } = row;

                const totalApplicationsRaw = await this.applicationRepo.query(
                    `
        SELECT COUNT(*) AS count
        FROM applications a
        JOIN opportunity o ON a."opportunityId" = o.id
        WHERE (o."OpportunityVersions"->0->>'title') = $1
          AND o."createdById" = $2  -- même filtre
        `,
                    [jobTitle, filters.ownerId],
                );
                //                 const applicationsRaw = await this.applicationRepo.query(
                //                     `
                //   SELECT a.*, c."monthsOfExperiences", a."cvvideo" AS "cvVideoUrl"
                //   FROM applications a
                //   JOIN opportunity o ON a."opportunityId" = o.id
                //   JOIN "user" c ON a."candidateId" = c.id
                //   WHERE (o."OpportunityVersions"->0->>'title') = $1
                //     AND o."createdById" = $3
                //     ${filters.hasCvVideo ? `AND trim(coalesce(a."cvvideo", '')) <> ''` : ''}
                //   ORDER BY a."applicationDate" DESC
                //   LIMIT $2
                //   `,
                //                     [jobTitle, filters.ownerId,filters.applicationPageSize],
                //                 );

                const applicationsRaw = await this.applicationRepo.query(
                    `
  SELECT a.*, c."monthsOfExperiences", a."cvvideo" AS "cvVideoUrl"
  FROM applications a
  JOIN opportunity o ON a."opportunityId" = o.id
  JOIN "user" c ON a."candidateId" = c.id
  WHERE (o."OpportunityVersions"->0->>'title') = $1
    AND o."createdById" = $3
    ${filters.hasCvVideo ? `AND trim(coalesce(a."cvvideo", '')) <> ''` : ''}
  ORDER BY a."applicationDate" DESC
  LIMIT $2
  `,
                    // ordre correct : jobTitle, limit, ownerId
                    [jobTitle, filters.applicationPageSize, filters.ownerId],
                );

                const totalApplications = Number(totalApplicationsRaw[0]?.count || 0);
                const sum = applicationsRaw.reduce((a: any, b: any) => a + (b.monthsOfExperiences || 0), 0);
                const avg = applicationsRaw.length ? sum / applicationsRaw.length : 0;
                const averageExperience = Math.round((avg / 12) * 10) / 10;
                const videoCvCount = applicationsRaw.filter((a: any) => !!a.cvVideoUrl && a.cvVideoUrl.trim() !== '').length;

                return {
                    jobTitle,
                    opportunityId,
                    status,
                    industry,
                    country,
                    city,
                    applications: applicationsRaw,
                    totalApplications,
                    totalPagesApplications: Math.ceil(totalApplications / filters.applicationPageSize),
                    averageExperience,
                    videoCvCount,
                };
            }),
        );

        return {
            pageNumber: filters.pageNumber,
            pageSize: filters.pageSize,
            totalPages: Math.ceil(totalJobs / filters.pageSize),
            total: totalJobs,
            jobs,
        };
    }

    async getCandidatesByOpportunityId(opportunityId: string, query: any) {
        const pageNumber = parseInt(query.page as string, 10) || 1;
        const pageSize = parseInt(query.size as string, 10) || 10;

        const hasCvVideo = query.hasCvVideo === 'true';
        const searchTerm = (query.search as string) || undefined;

        const excludeScheduled = query.excludeScheduled === 'true';

        const interestRaw = query.interest as string | undefined;
        let interest: InterestStatus | undefined;
        if (interestRaw && Object.values(InterestStatus).includes(interestRaw as InterestStatus)) {
            interest = interestRaw as InterestStatus;
        }

        const [applications, total] = await this.applicationRepo.findCandidatesByOpportunityWithFilters(opportunityId, pageNumber, pageSize, {
            interest,
            hasCvVideo,
            searchTerm,
            excludeScheduled,
        });

        const candidates = await Promise.all(
            applications.map(async app => {
                let resumeDisplayName: string | null = null;
                if (app.resume) {
                    const fileName = app.resume.split('/').pop()!;
                    resumeDisplayName = (await this.fileRepo.findByFileName(fileName))?.fileDisplayName ?? null;
                }
                let resumeVideo: string | null = null;
                let resumeVideoDisplayName: string | null = null;

                if (app.cvvideo) {
                    resumeVideo = app.cvvideo;
                    const videoFileName = resumeVideo.split('/').pop()!;
                    resumeVideoDisplayName = (await this.fileRepo.findByFileName(videoFileName))?.fileDisplayName ?? null;
                }

                return {
                    candidate: app.candidate,
                    status: app.status,
                    applicationId: app.id,
                    applicationDate: app.applicationDate,
                    resume: app.resume ?? null,
                    resumeDisplayName,
                    resumeVideo,
                    resumeVideoDisplayName,
                    interest: app.interest as InterestStatus,
                };
            }),
        );

        return {
            pageNumber,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            total,
            candidates,
        };
    }

    async updateInterestStatus(id: string, interest: InterestStatus) {
        const application = await this.applicationRepo.findById(id);

        if (!application) {
            throw new HttpException(404, 'Application not found');
        }

        application.interest = interest;

        return await this.applicationRepo.save(application);
    }

    async findById(id: string): Promise<ApplicationI | null> {
        return await this.applicationRepo.findById(id);
    }
    async delete(candidateId: string, applicationId: string): Promise<void> {
        const application = await this.applicationRepo.findByIdWithRelations(applicationId);
        if (!application) {
            throw new HttpException(404, 'Application not found');
        }

        if (application.candidate?.id !== candidateId) {
            throw new HttpException(401, 'You can only withdraw your own applications');
        }

        const success = await this.applicationRepo.delete(applicationId);
        if (!success) {
            throw new HttpException(500, 'Failed to withdraw application');
        }
    }

    async update(id: string, update: Partial<ApplicationI>): Promise<ApplicationI | null> {
        console.log(`🔄 Mise à jour de la candidature ID: ${id} avec données:`, update);
        console.log(`📹 Nouveau CV vidéo reçu :`, update.cvvideo); // 🔍 nouveau log
        const application = await this.applicationRepo.findByIdWithRelations(id);
        if (!application) {
            return null;
        }

        const oldStatus = application.status;

        const updatedApp = await this.applicationRepo.update(id, update);

        if (update.status && update.status !== oldStatus) {
            const candidateId = application.candidate?.id;
            const opportunityId = application.opportunity?.id;

            if (!candidateId) {
                console.error(`❌ Impossible de récupérer l'ID du candidat`);
            } else {
                console.log(`✔️ ID candidat récupéré : ${candidateId}`);
            }

            if (!opportunityId) {
                console.error(`❌ Impossible de récupérer l'ID de l’opportunité`);
            } else {
                console.log(`✔️ ID opportunité récupéré : ${opportunityId}`);
            }

            if (!candidateId || !opportunityId) {
                console.error(`❌ Abandon envoi email : données manquantes.`);
                return updatedApp;
            }

            const candidate = (await this.userRepo.findById(candidateId)) as CandidateUser;
            const opportunity = await this.opportunityRepo.findById(opportunityId);

            if (!candidate) {
                console.error(`❌ Aucun candidat trouvé avec l'ID: ${candidateId}`);
                return updatedApp;
            }
            if (!candidate.email) {
                console.error(`❌ Le candidat n'a pas d'email.`);
                return updatedApp;
            }
            if (!opportunity) {
                console.error(`❌ Aucune opportunité trouvée avec l'ID: ${opportunityId}`);
                return updatedApp;
            }

            const opportunityTitle =
                opportunity.OpportunityVersions?.find(v => v.language === 'fr')?.title ||
                opportunity.OpportunityVersions?.[0]?.title ||
                'Titre non disponible';

            console.log(`📨 Envoi de l'email à: ${candidate.email}, avec titre: "${opportunityTitle}"`);

            let paragraphplus: string[] = [];
            let backgroundImageUrl = 'https://i.ibb.co/RTH9N0C1/Login-1.png';

            if (update.status === ApplicationStatus.ACCEPTED) {
                paragraphplus = [`Congratulations on your new position!`];
                backgroundImageUrl = 'https://i.ibb.co/TxNrZZv8/Accepted.png'; // link for accepted
            } else if (update.status === ApplicationStatus.REJECTED) {
                paragraphplus = [`Don't give up — this is not the end of the road.`];
                backgroundImageUrl = 'https://i.ibb.co/s9650j1j/Rejected.png'; // link for rejected
            } else {
                paragraphplus = ['Thank you for your application. We will get back to you shortly.'];
            }

            sendEmail({
                to: candidate.email,
                subject: 'Update on Your Application Status',
                template: 'emailTemplate',
                context: {
                    title: 'Update on Your Application Status',
                    backgroundImageUrl,
                    cardText: 'Your Application Status',
                    fullName: candidate.fullName,
                    opportunityTitle: opportunityTitle,
                    opportunityStatus: update.status,
                    paragraphs: [
                        `There has been an update regarding your application for the position of <strong>${opportunityTitle}</strong>.
The current status of your application is: <span style="font-weight: bold; color: #7c83f5;">${update.status}</span>`,
                        ...paragraphplus,
                    ],
                    signatureName: 'The Maps Team',
                    companyName: 'Maps',
                    year: new Date().getFullYear(),
                },
            });

            console.log(`✅ Email envoyé avec succès à ${candidate.email}`);
        }

        return updatedApp;
    }

    async findByCandidateId(candidateId: string): Promise<ApplicationI[]> {
        return await this.applicationRepo.findByCandidateId(candidateId);
    }

    async applyToOpportunity(user: any, candidateId: string, opportunityId: string, file?: Express.Multer.File) {
        const opportunity = await this.opportunityRepo.findById(opportunityId);
        if (!opportunity) {
            if (file) await fs.unlink(file.path);
            throw { status: 404, message: 'Opportunity not found' };
        }

        const candidate = (await this.userRepo.findById(candidateId)) as CandidateUser;
        if (!candidate) {
            if (file) await fs.unlink(file.path);
            throw { status: 404, message: 'Candidate not found' };
        }

        const alreadyApplied = await this.applicationRepo.findExistingApplication(candidateId, opportunityId);
        if (alreadyApplied) {
            if (file) await fs.unlink(file.path);
            throw { status: 400, message: 'Already applied to this opportunity' };
        }

        let resumePath: string | undefined;

        if (file) {
            const checksum = await computeChecksumFromFilePath(file.path);
            const resource = file.generatedResource || 'resumes';
            const folder = new Date().getFullYear().toString();

            const existingFile = await this.fileRepo.findOne({
                where: {
                    candidate: { id: candidateId },
                    resource,
                    checksum,
                },
                order: { createdAt: 'DESC' },
            });

            if (existingFile) {
                await fs.unlink(file.path);
                resumePath = existingFile.filePath;
                console.log('📎 Reprise du fichier existant :', resumePath);
            } else {
                const uuid = crypto.randomUUID();
                const extension = path.extname(file.originalname);
                const extensionNoDot = extension.replace('.', '');
                const finalFileName = `${uuid}${extension}`;
                const relativePath = path.join(folder, resource, finalFileName).replace(/\\/g, '/');
                const absoluteFolder = path.join(process.cwd(), 'uploads', folder, resource);
                const finalPath = path.join(absoluteFolder, finalFileName);

                await fs.mkdir(absoluteFolder, { recursive: true });
                await fs.rename(file.path, finalPath);

                const fileDisplayName = resource === 'resumes' ? file.originalname : `${resource}_${candidate.fullName}.${extensionNoDot}`;

                const fileData: FileI = {
                    folder,
                    resource,
                    filePath: relativePath,
                    ipSender: 'unknown',
                    uuid,
                    fileName: finalFileName,
                    fileType: file.mimetype,
                    fileSize: String(file.size),
                    checksum,
                    isAttached: true,
                    candidate,
                    fileDisplayName,
                };

                delete (candidate as any).files;

                await this.fileRepo.save(fileData);
                resumePath = relativePath;
                console.log('✅ Fichier sauvegardé :', resumePath);
            }
        }

        if (!resumePath && candidate.cvUrl) {
            resumePath = candidate.cvUrl;
        }

        if (!opportunity.applicants) {
            opportunity.applicants = [];
        }

        const alreadyLinked = opportunity.applicants.find(app => app.id === candidate.id);
        if (!alreadyLinked) {
            opportunity.applicants.push(candidate);

            // 🧼 Supprime relation circulaire si existante
            delete (opportunity as any).applications;

            await this.opportunityRepo.save(opportunity);
            console.log('✅ Candidat ajouté à la relation applicants');
        }

        const application: Partial<ApplicationI> = {
            candidate,
            opportunity,
            resume: resumePath,
            applicationDate: new Date(),
            note: '',
            status: ApplicationStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const savedApplication = await this.applicationRepo.create(application);

const fullApplication = await this.applicationRepo.findByIdWithRelations(savedApplication.id);

if (!fullApplication) {
  throw new Error('Application could not be found after creation');
}




const opportunityTitle =
    opportunity.OpportunityVersions.find(v => v.language === 'en')?.title ||
    opportunity.OpportunityVersions[0]?.title ||
    'Title not available';

sendEmail({
    to: candidate.email,
    subject: 'Your Application Has Been Received',
    template: 'emailTemplate',
    context: {
        title: 'Your Application Has Been Received',
        backgroundImageUrl: 'https://i.ibb.co/VYMbpQC4/Apply.png',
        cardText: 'New Application',
        fullName: candidate.fullName,
        paragraphs: [
            `Thank you for applying for the position of <strong>${opportunityTitle}</strong>.`,
            'We have received your application and will review it as soon as possible.',
        ],
        signatureName: 'The Maps Team',
        companyName: 'Maps',
        year: new Date().getFullYear(),
    },
});

return {
    message: 'Application successful',
    resumeAlreadyExisted: !!(file && resumePath !== file.path),
    application: fullApplication, // ✅ maintenant complet et conforme à ApplicationI
};

    }

    async updateCvVideo(userId: string, applicationId: string, file: Express.Multer.File): Promise<ApplicationI> {
        const application = await this.applicationRepo.findByIdWithRelations(applicationId);
        if (!application) throw { status: 404, message: 'Application not found' };

        if (application.candidate.id !== userId) {
            await fs.unlink(file.path);
            throw { status: 403, message: 'Unauthorized: You do not own this application' };
        }

        const candidate = await this.userRepo.findOne({ id: userId });
        if (!candidate) throw { status: 404, message: 'User not found' };

        const checksum = await computeChecksumFromFilePath(file.path);
        const folder = new Date().getFullYear().toString();
        const resource = 'video';

        console.log('📄 Checksum:', checksum);
        console.log('👤 userId (auth connecté):', userId);

        const existingFile = await this.fileRepo.findOne({
            where: {
                candidate: { id: candidate.id },
                checksum,
                isAttached: true,
                resource,
            },
            order: { createdAt: 'DESC' },
        });

        const existingPath = existingFile?.filePath?.replace(/\\/g, '/').trim();
        const currentPath = application.cvvideo?.replace(/\\/g, '/').trim();

        console.log('📂 existingFilePath:', existingPath);
        console.log('📂 current cvvideo path:', currentPath);

        if (existingFile && existingPath === currentPath) {
            console.log('✅ Même fichier déjà utilisé pour cette application. Aucun traitement.');
            await fs.unlink(file.path);
            return application;
        }
        if (existingFile?.isArchived) {
            existingFile.isArchived = false;
        }
        let cvVideoPath: string;

        if (existingFile) {
            await fs.unlink(file.path);
            console.log('♻️ Réutilisation du fichier existant');
            cvVideoPath = existingPath!;
        } else {
            const uuid = crypto.randomUUID();
            const extension = path.extname(file.originalname);
            const finalFileName = `${uuid}${extension}`;
            const relativePath = path.join(folder, resource, finalFileName).replace(/\\/g, '/');
            const absoluteFolder = path.join(process.cwd(), 'uploads', folder, resource);
            const finalPath = path.join(absoluteFolder, finalFileName);

            await fs.mkdir(absoluteFolder, { recursive: true });
            await fs.rename(file.path, finalPath);

            const fileData: FileI = {
                folder,
                resource,
                filePath: relativePath,
                ipSender: 'unknown',
                uuid,
                fileName: finalFileName,
                fileType: file.mimetype,
                fileSize: String(file.size),
                checksum,
                isAttached: true,
                candidate,
                fileDisplayName: file.originalname,
            };

            const savedFile = await this.fileRepo.save(fileData);

            cvVideoPath = savedFile.filePath ?? '';
        }

        const updated = await this.applicationRepo.update(applicationId, { cvvideo: cvVideoPath });
        if (!updated) throw { status: 500, message: 'Update failed' };

        return updated;
    }

    public async getAllGroupedByJobOffer(queries: any): Promise<any> {
        const { recruiterId, pageNumber = 1, pageSize = 10, paginated } = queries;

        if (!recruiterId) {
            throw new HttpException(401, 'User  not authenticated');
        }

        try {
            const allApplications = await this.applicationRepo.getAll({ recruiterId });
            const { applications } = allApplications;

            const grouped: Record<string, any> = {};

            applications.forEach((app: any) => {
                const opp = app.opportunity;
                const candidate = app.candidate;

                if (!opp?.id || !candidate) return;

                const jobId = opp.id;
                const jobTitle = opp.OpportunityVersions?.[0]?.title ?? '';

                if (!grouped[jobId]) {
                    grouped[jobId] = {
                        job: {
                            id: opp.id,
                            jobTitle,
                            country: opp.country ?? null,
                            city: opp.city ?? null,
                        },
                        candidates: [],
                    };
                }

                grouped[jobId].candidates.push({
                    applicationId: app.id,
                    status: app.status,
                    applicationDate: app.applicationDate,
                    resume: app.resume ?? null,
                    cvvideo: app.cvvideo ?? null,
                    interest: app.interest,
                    candidate: {
                        id: candidate.id,
                        fullName: candidate.fullName,
                        email: candidate.email,
                        profilePicture: candidate.profilePicture,
                        country: candidate.country ?? null,
                        targetRole: candidate.targetRole ?? null,
                    },
                });
            });

            const jobOffers = Object.values(grouped);
            const start = (pageNumber - 1) * pageSize;
            const paginatedJobs = jobOffers.slice(start, start + pageSize);

            if (paginated) {
                return {
                    totalApplications: applications.length,
                    jobOffers: paginatedJobs,
                };
            }

            return {
                pageNumber,
                pageSize,
                total: jobOffers.length,
                totalPages: Math.ceil(jobOffers.length / pageSize),
                jobOffers: paginatedJobs,
            };
        } catch (error) {
            console.error('Error in getAllGroupedByJobOffer:', error);
            throw new HttpException(500, 'Could not fetch applications grouped by job offer');
        }
    }
}