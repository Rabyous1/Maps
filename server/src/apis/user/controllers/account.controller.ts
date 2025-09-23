import { Router, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import isAuthenticated from '@/middlewares/authentication.middleware';
import AccountService from '../services/account.service';
import apiKeyMiddleware from '@/middlewares/validateApiKey.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { updatePasswordSchema, updateUserAccountSchema } from '../users.validations';
import { logoutHandler } from '@/utils/helpers/logout.helper';
import { Role } from '@/utils/helpers/constants';
import { hasRoles } from '@/middlewares/authorization.middleware';

class AccountController implements Controller {
    public path = '/account';
    public router = Router();

    private accountService = new AccountService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(`${this.path}`, isAuthenticated, apiKeyMiddleware, this.getAccount);
        this.router.put(
            `${this.path}`,
            isAuthenticated, //uploadMiddleware,
            validationMiddleware(updateUserAccountSchema),
            this.updateAccount,
        );
        this.router.put(`${this.path}/password`, validationMiddleware(updatePasswordSchema), isAuthenticated, this.updatePassword);

        this.router.patch(`${this.path}/complete`, isAuthenticated, this.markAsCompleted);
        this.router.delete(`${this.path}`, isAuthenticated, this.deleteAccount);
        this.router.post(`${this.path}/reveal-fiscal`, isAuthenticated, hasRoles(Role.RECRUTEUR), this.revealFiscal);
    }
    private revealFiscal = async (req: any, res: Response, next: NextFunction) => {
        try {
            const id: string = req.user._id;
            const { password } = req.body as { password?: string };

            if (!password) {
                return res.status(400).json({ success: false, message: 'Password is required' });
            }

            const fiscalNumber = await this.accountService.revealFiscal(id, password);

            if (!fiscalNumber) {
                return res.status(401).json({ success: false, message: 'Incorrect password' });
            }

            return res.status(200).json({ success: true, fiscalNumber });
        } catch (error) {
            next(error);
        }
    };

    private getAccount = async (request: any, response: Response, next: NextFunction) => {
        try {
            const id: string = request.user._id;
            const result = await this.accountService.getAccount({ id });
            response.send(result);
        } catch (error) {
            next(error);
        }
    };

    private updateAccount = async (request: any, response: Response, next: NextFunction) => {
        try {
            const id: string = request.user._id;
            const updateAccountData = request.body;
            await this.accountService.update(updateAccountData, id);
            response.send({
                updated: true,
                message: `Your account is updated successfully.`,
            });
        } catch (error) {
            next(error);
        }
    };
    private updatePassword = async (request: any, response: Response, next: NextFunction) => {
        try {
            const id: string = request.user._id;
            const updatePasswordData = request.body;

            await this.accountService.updatePassword(updatePasswordData, id);
            response.send({
                updated: true,
                message: `Your password is updated successfully.`,
            });
        } catch (error) {
            next(error);
        }
    };

    private deleteAccount = async (req: any, res: Response, next: NextFunction) => {
        try {
            const id: string = req.user._id;
            await this.accountService.deleteAccount(id);
            logoutHandler(req, res, next, 'Account deleted successfully.');
        } catch (error) {
            next(error);
        }
    };

    private markAsCompleted = async (request: any, response: Response, next: NextFunction) => {
        try {
            const id: string = request.user._id;
            await this.accountService.markAccountAsCompleted(id);

            response.send({
                updated: true,
                message: 'Account marked as completed.',
            });
        } catch (error) {
            next(error);
        }
    };
}

export default AccountController;
