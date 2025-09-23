import { Router, Request, Response, NextFunction } from 'express';
import isAuthenticated from '@/middlewares/authentication.middleware';
import { Role } from '@/utils/helpers/constants';
import { DashboardService } from './dashboard.service';

export class DashboardController {
    public path = '/dashboard';
    public router = Router();
    private service = new DashboardService();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(
            this.path,
            isAuthenticated,
            this.getDashboardByRole,
        );
    }
    private getDashboardByRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const userId = user._id;
            const role = user.roles;

            const to = typeof req.query.to === 'string' && !isNaN(Date.parse(req.query.to)) ? new Date(req.query.to) : new Date();

            const from =
                typeof req.query.from === 'string' && !isNaN(Date.parse(req.query.from))
                    ? new Date(req.query.from)
                    : new Date(new Date(to).setDate(to.getDate() - 30));

            const dateRange = { from, to };

            let data;
            if (role === Role.CANDIDAT) {
                data = await this.service.getDashboard(userId, dateRange);
            } else if (role === Role.RECRUTEUR) {
                data = await this.service.getRecruiterDashboard(userId, dateRange);
            } else {
                return res.status(403).json({ message: 'Unauthorized role' });
            }

            res.json(data);
        } catch (err) {
            next(err);
        }
    };
}
