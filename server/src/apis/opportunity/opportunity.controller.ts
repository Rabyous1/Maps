import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import { hasRoles } from '@/middlewares/authorization.middleware';
import validateQueries from '@/middlewares/queries-validation.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { NotificationTypes, Role } from '@/utils/helpers/constants';
import { createOpportunitySchema, updateOpportunitySchema } from './opportunity.validations';
import { isAuthenticated } from './opportunity.middlewares';

import OpportunityService from './opportunity.service';
import { emitNotification } from '@/utils/config/socket/events/emitNotification';

class OpportunityController implements Controller {
    public path = '/opportunities';
    public router = Router();
    private opportunityService = new OpportunityService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(`${this.path}/published`, this.getAllPublished);
        this.router.get(`${this.path}/myopp`, isAuthenticated, hasRoles(Role.RECRUTEUR), this.getMyOpportunities);
        this.router.get(`${this.path}/pins`, this.getPins);
        this.router.get(`${this.path}/allopp`, validateQueries, this.getAll);
        this.router.get(`${this.path}/favorites`, isAuthenticated, hasRoles(Role.CANDIDAT), this.getFavoriteOpportunities);
        this.router.get(`${this.path}/:id`, isAuthenticated, hasRoles(Role.RECRUTEUR, Role.CANDIDAT), this.getById);
        this.router.post(
            `${this.path}/newopp`,
            isAuthenticated,
            hasRoles(Role.RECRUTEUR),
            validationMiddleware(createOpportunitySchema),
            this.create,
        );
        this.router.put(`${this.path}/:id`, isAuthenticated, hasRoles(Role.RECRUTEUR), validationMiddleware(updateOpportunitySchema), this.update);
        this.router.delete(`${this.path}/:id`, isAuthenticated, hasRoles(Role.RECRUTEUR), this.delete);
        this.router.patch(`${this.path}/:id/recover`, isAuthenticated, hasRoles(Role.RECRUTEUR), this.recover);
        this.router.post(`${this.path}/:id/favorite`, isAuthenticated, hasRoles(Role.CANDIDAT), this.addToFavorites);
        this.router.delete(`${this.path}/:id/favorite`, isAuthenticated, hasRoles(Role.CANDIDAT), this.removeFromFavorites);
        this.router.patch(`${this.path}/:id/archive`, isAuthenticated, hasRoles(Role.RECRUTEUR), this.toggleArchive);
    }

    private getAllPublished = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const opportunities = await this.opportunityService.getPublished();
            res.status(200).json(opportunities);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving published opportunities' });
        }
    };

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = req.query;
            const opportunities = await this.opportunityService.filterOpportunities(filters);
            res.json(opportunities);
        } catch (err) {
            res.status(400).json({ message: 'Error retrieving opportunities' });
        }
    };
    private getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            const opportunity = await this.opportunityService.get(id);

            if (!opportunity) {
                return res.status(404).json({ message: 'Opportunity not found' });
            }

            res.status(200).json(opportunity);
        } catch (error) {
            next(error);
        }
    };

    private create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            if (!user || !user._id) throw new Error('User is not authenticated');

            const result = await this.opportunityService.create(req.body, user._id);
            await emitNotification({
                senderId: user._id,
                receiverId: user._id,
                type: NotificationTypes.OPPORTUNITY_CREATED,
                content: `Your opportunity "${result.reference}" was created successfully.`,
                targetId: result.id,
            });
            res.send({ result, message: 'Opportunity created successfully!' });
        } catch (error) {
            next(error);
        console.log(error);

        }
    };

    private update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user._id;
            const updated = await this.opportunityService.update(req.params.id, req.body, userId);
            res.send({ result: updated, message: 'Opportunity updated successfully!' });
        } catch (err) {
            next(err);
        }
    };

    private delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user._id;

            await this.opportunityService.delete(req.params.id);

            await emitNotification({
                senderId: process.env.SYSTEM_USER_ID!, 
                receiverId: userId, 
                type: NotificationTypes.SYSTEM,
                content: 'Your opportunity was deleted successfully.',
            });

            res.send({ message: 'Opportunity deleted successfully' });
        } catch (error) {
            next(error);
        }
    };

    private recover = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.opportunityService.recover(req.params.id);
            res.send({ message: 'Opportunity recovered successfully' });
        } catch (error) {
            next(error);
        }
    };

    private addToFavorites = async (req: any, res: Response, next: NextFunction) => {
        try {
            const opportunityId = req.params.id;
            const userId = req.user._id;
            console.log('ID:', req.params.id);
            console.log('Body:', req.body);
            const result = await this.opportunityService.addToFavorites(userId, opportunityId);
            res.status(200).json({ result, message: 'Opportunity added to favorites!' });
        } catch (error) {
            next(error);
        }
    };

    private removeFromFavorites = async (req: any, res: Response, next: NextFunction) => {
        try {
            const opportunityId = req.params.id;
            const userId = req.user._id;

            await this.opportunityService.removeFavoriteOpportunity(userId, opportunityId);

            res.status(200).json({ message: 'Opportunity removed from favorites!' });
        } catch (error) {
            next(error);
        }
    };

    private getFavoriteOpportunities = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user._id;
            const { pageNumber, pageSize, paginated } = req.query;
            console.log('Pagination params:', { pageNumber, pageSize, paginated });
            const result = await this.opportunityService.getFavoriteOpportunities(userId, { pageNumber, pageSize, paginated });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    private getMyOpportunities = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user._id;
            const pageNumber = Number(req.query.pageNumber) || 1;
            const pageSize = Number(req.query.pageSize) || 10;
            const filters = { ...req.query };
            delete filters.pageNumber;
            delete filters.pageSize;
            const result = await this.opportunityService.getOpportunitiesByCreatorWithDetails(userId, pageNumber, pageSize, filters);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    private getPins = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = {
                ...req.query,
                isPublished: true,
            };
            const all = await this.opportunityService.filterOpportunities(filters);

            const pins = all
                .filter(opp => !!opp.city)
                .map(opp => ({
                    label: opp.OpportunityVersions?.[0]?.title || 'Untitled',
                    location: {
                        lat: opp.city?.lat,
                        lon: opp.city?.lng,
                        city: opp.city?.name,
                    },
                    country: opp.country,
                    industry: opp.industry,
                    publisheddate: opp.publishAt,
                    reference: opp.reference,
                    EmploymentType: opp.employmentType,
                    id: opp.id,
                    contractType: opp.contractType,
                }));

            res.json(pins);
        } catch (error) {
            next(error);
        }
    };

    private toggleArchive = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user._id;
            const { isArchived } = req.body;
            const oppId = req.params.id;

            if (typeof isArchived !== 'boolean') {
                return res.status(400).json({ message: 'isArchived must be a boolean' });
            }

            const existing = await this.opportunityService.get(oppId);
            if (!existing) {
                return res.status(404).json({ message: 'Opportunity not found' });
            }

            const success = await this.opportunityService.archiveOpportunity(oppId, isArchived, userId);
            if (!success) {
                return res.status(403).json({ message: 'Not authorized to archive this opportunity' });
            }

            const type = isArchived ? NotificationTypes.OPPORTUNITY_ARCHIVED : NotificationTypes.OPPORTUNITY_UNARCHIVED;

            await emitNotification({
                senderId: process.env.SYSTEM_USER_ID!,
                receiverId: userId,
                type: NotificationTypes.SYSTEM,
                content: isArchived
                    ? `Your opportunity "${existing.reference}" was archived.`
                    : `Your opportunity "${existing.reference}" was unarchived.`,
            });

            return res.status(200).json({
                message: `Opportunity ${isArchived ? 'archived' : 'unarchived'} successfully.`,
            });
        } catch (err) {
            next(err);
        }
    };
}

export default OpportunityController;
