import { Router, Request, Response, NextFunction } from 'express';
import { ApplicationService } from './application.service';
import { restrictTo } from '@/middlewares/role.middleware';
import isAuthenticated from '@/middlewares/authentication.middleware';
import { InterestStatus, NotificationTypes, Role } from '@/utils/helpers/constants';
import { uploadMiddleware } from '@/middlewares/upload-file.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { applicationUpdateSchema, interestUpdateSchema } from './application.validation';
import { emitNotification } from '@/utils/config/socket/events/emitNotification';

export class ApplicationController {
    public path = '/applications';
    public router = Router();
    private service = new ApplicationService();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}/:id/apply`, isAuthenticated, restrictTo(Role.CANDIDAT), uploadMiddleware, this.applyToOpportunity);
        this.router.get(`${this.path}/myapplications`, isAuthenticated, restrictTo(Role.CANDIDAT), this.getMyApplications);
        this.router.get(this.path, isAuthenticated, restrictTo(Role.RECRUTEUR), this.getJobsWithApplicationsPaginated);
        this.router.get(`${this.path}/:id/candidates`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.getCandidatesByOpportunityId);
        this.router.put(`${this.path}/:id`, isAuthenticated, validationMiddleware(applicationUpdateSchema), this.update);
        this.router.put(`${this.path}/:id/interest`, isAuthenticated, validationMiddleware(interestUpdateSchema), this.updateInterestStatus);
        this.router.put(`${this.path}/:id/updatestatus`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.updateStatus);

        this.router.delete(`${this.path}/:id`, isAuthenticated, restrictTo(Role.CANDIDAT), this.delete);
        this.router.get(`${this.path}/candidate/:candidateId`, isAuthenticated, restrictTo(Role.CANDIDAT), this.getByCandidateId);
        this.router.put(`${this.path}/:id/cvvideo`, isAuthenticated, uploadMiddleware, this.updateCvVideo);
        this.router.get(`${this.path}/list`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.getAll);
    }
    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const recruiterId = user?._id;

            if (!recruiterId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const queries: any = {
                ...req.query,
                recruiterId,
            };

            const result = await this.service.getAllGroupedByJobOffer(queries);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    private applyToOpportunity = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const candidateId = user?._id;
            const opportunityId = req.params.id;
            const file = req.file;

            if (!candidateId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const { message, resumeAlreadyExisted, application } = await this.service.applyToOpportunity(user, candidateId, opportunityId, file);

            if (!application) {
    return res.status(500).json({ message: 'Application not found after creation' });
}

            res.status(200).json({
                message,
                resumeAlreadyExisted,
                application,
                applicationId: application.id,
            });
        } catch (error) {
            next(error);
        }
    };
    private updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ message: 'Status is required' });
            }

            const updatedApp = await this.service.updateApplicationStatus(id, status);

            if (!updatedApp) {
                return res.status(404).json({ message: 'Application not found' });
            }
            console.log(updatedApp);
            await emitNotification({
                senderId: process.env.SYSTEM_USER_ID!,
                receiverId: updatedApp.candidate?.id,
                type: NotificationTypes.APPLICATION_STATUS_UPDATED,
                content: `Your application status has been updated to "${status}".`,
            });
            return res.status(200).json({
                message: 'Application status updated successfully',
                application: updatedApp,
            });
        } catch (error) {
            next(error);
        }
    };

    private getJobsWithApplicationsPaginated = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const pageNumber = parseInt(req.query.pageNumber as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 5;
            const applicationPageSize = parseInt(req.query.applicationPageSize as string) || 5;
            const jobTitleFilter = (req.query.jobTitleFilter as string) || undefined;
            const locationFilter = (req.query.locationFilter as string) || undefined;
            const applicationStatus = req.query.applicationStatus as string;
            const applicationDateStart = req.query.applicationDateStart as string;
            const applicationDateEnd = req.query.applicationDateEnd as string;
            const hasCvVideoRaw = req.query.hasCvVideo;
            const hasCvVideo = ['true', '1', 'yes', 'y'].includes((hasCvVideoRaw || '').toString().toLowerCase());

            const industryFilter = req.query.industryFilter as string;
            const onlyOpenJobsRaw = req.query.onlyOpenJobs; 
            const onlyOpenJobs = ['true', '1', 'yes', 'y'].includes((onlyOpenJobsRaw || '').toString().toLowerCase());

            const user = (req as any).user;
            const userId = user?._id;

            const filters: any = {
                pageNumber,
                pageSize,
                jobTitleFilter,
                locationFilter,
                applicationStatus,
                applicationDateStart,
                applicationDateEnd,
                hasCvVideo,
                industryFilter,
                onlyOpenJobs, 
                ownerId: userId,
            };

            const result = await this.service.getJobsWithApplicationsPaginated(filters);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    private getCandidatesByOpportunityId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const opportunityId = req.params.id;
            const candidates = await this.service.getCandidatesByOpportunityId(opportunityId, req.query as any);
            res.status(200).json(candidates);
        } catch (error) {
            next(error);
        }
    };

    private update = async (req: Request, res: Response) => {
        try {
            const updated = await this.service.update(req.params.id, req.body);
            if (!updated) return res.status(404).json({ message: 'Application not found' });
            res.status(200).json(updated);
        } catch (error) {
            console.error('Update application failed:', error);
            res.status(500).json({ message: 'Failed to update application' });
        }
    };
    private updateInterestStatus = async (req: Request, res: Response) => {
        try {
            const interest: InterestStatus = req.body.interest;
            const updated = await this.service.updateInterestStatus(req.params.id, interest);
            if (!updated) return res.status(404).json({ message: 'Application not found' });
            res.status(200).json(updated);
            if (!interest) {
    return res.status(400).json({ message: "Interest is required" });
}

        } catch (error: any) {
            if (error.status && error.message) {
                return res.status(error.status).json({ message: error.message });
            }
            console.error('Update application failed:', error);
            res.status(500).json({ message: 'Failed to update application status' });
        }
    };

    private getByCandidateId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { candidateId } = req.params;
            const applications = await this.service.findByCandidateId(candidateId);
            res.status(200).json(applications);
        } catch (error) {
            next(error);
        }
    };

    private delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const candidateId = (req as any).user._id as string;
            const applicationId = req.params.id;

            await this.service.delete(candidateId, applicationId);
            return res.status(200).json({ message: 'Application deleted successfully' });
        } catch (err) {
            return next(err);
        }
    };

    private getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const candidateId = user?._id;

            const page = parseInt((req.query.pageNumber as string) || (req.query.page as string)) || 1;

            const limit = parseInt((req.query.pageSize as string) || (req.query.limit as string)) || 10;

            const startDate = req.query.applicationDateStart as string;
            const endDate = req.query.applicationDateEnd as string;

            const filters = {
                status: req.query.status as string,
                searchTitle: req.query.searchTitle as string,
                searchNote: req.query.searchNote as string,
                applicationDate: startDate && endDate ? { startDate, endDate } : undefined,
            };

            const [applicationsData, stats] = await Promise.all([
                this.service.findMyApplications(candidateId, page, limit, filters),
                this.service.getCandidateStats(candidateId),
            ]);

            res.status(200).json({
                ...applicationsData,
                stats,
            });
        } catch (error) {
            next(error);
        }
    };
    private updateCvVideo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const file = req.file;
            const applicationId = req.params.id;

            if (!file) return res.status(400).json({ message: 'Aucun fichier fourni.' });

            const updated = await this.service.updateCvVideo(user._id, applicationId, file);
            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    };
}
