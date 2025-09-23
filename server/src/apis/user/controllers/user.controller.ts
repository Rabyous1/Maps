import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import isAuthenticated from '@/middlewares/authentication.middleware';
import UserService from '../services/user.service';
import { uploadMiddleware } from '@/middlewares/upload-file.middleware';
import validateQueries from '@/middlewares/queries-validation.middleware';
import { validateParams, validateUUID, validationMiddleware } from '@/middlewares/validation.middleware';
import { createUserSchema, updateUserSchema } from '../users.validations';
import { excludeLoggedInUser, hasRoles } from '@/middlewares/authorization.middleware';
import apiKeyMiddleware from '@/middlewares/validateApiKey.middleware';
import { Role } from '@/utils/helpers/constants';
import { validate as isUUID } from 'uuid';
import { User } from '../interfaces/user.interfaces';
import HttpException from '@/utils/exceptions/http.exception';
import { validateAllowedResource, validateExtension } from '@/utils/helpers/fileValidation.util';
import path from 'path';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private userService = new UserService();
    constructor() {
        this.initialiseRoutes();
    }

    private validateId = (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!isUUID(id)) {
            return res.status(400).send({ message: 'Invalid id' });
        }
        next();
    };

    private initialiseRoutes(): void {
        this.router.get(
            `${this.path}`,
            isAuthenticated,
            excludeLoggedInUser(),
            hasRoles(Role.ADMIN),
            validateQueries,
            validateUUID,
            apiKeyMiddleware,
            this.getUsers,
        );
        this.router.get(
            `${this.path}/frequent-users`,
            isAuthenticated,
            hasRoles(Role.CANDIDAT, Role.RECRUTEUR),
            apiKeyMiddleware,
            this.getTopFrequentMessagedUsers,
        );
        this.router.get(
            `${this.path}/messaged-users`,
            isAuthenticated,
            hasRoles(Role.CANDIDAT, Role.RECRUTEUR),
            apiKeyMiddleware,
            this.getUsersByOppositeRole,
        );
        this.router.get(
            `${this.path}/conversations`,
            isAuthenticated,
            hasRoles(Role.CANDIDAT, Role.RECRUTEUR),
            apiKeyMiddleware,
            this.getMessagedUsersByOppositeRole,
        );


        this.router.get(
            `${this.path}/current`,
            isAuthenticated,
            validateQueries, //checkUserExists,
            apiKeyMiddleware,
            this.getCurrent,
        );
        this.router.post(
            `${this.path}`,
            isAuthenticated,
            hasRoles(Role.ADMIN),
            uploadMiddleware,
            validationMiddleware(createUserSchema),
            this.createUser,
        );
        this.router.get(`${this.path}/:id`, isAuthenticated, hasRoles(Role.ADMIN), this.validateId, apiKeyMiddleware, this.get);
        this.router.delete(`${this.path}/:id`, isAuthenticated, hasRoles(Role.ADMIN), this.validateId, this.deleteUser);
        this.router.patch(`${this.path}/:id`, isAuthenticated, hasRoles(Role.ADMIN), this.validateId, this.recoverUser);
        this.router.put(
            `${this.path}/:id`,
            isAuthenticated,
            hasRoles(Role.ADMIN),
            this.validateId,
            uploadMiddleware,
            validationMiddleware(updateUserSchema),
            this.updateUser,
        );
        this.router.post(
            `${this.path}/:userId/:resource/:folder`,
            validateParams,
            // fileExistMiddleware,
            uploadMiddleware,
            this.uploadFileToUserController,
        );
    }
    private getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queries: any = req.query;
            const result = await this.userService.getAll(queries);

            res.send(result);
        } catch (error) {
            next(error);
        }
    };
    private getTopFrequentMessagedUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = req.user as User;
            const role = currentUser.roles as Role;
            const id = (req.user as { _id: string })._id;


            const users = await this.userService.getTopFrequentMessagedUsers(id, role);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    };

    private getUsersByOppositeRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = req.user as User;
            const role = currentUser.roles as Role;

            //if (!role) throw new HttpException(400, 'User role not found.');

            const result = await this.userService.getUsersByOppositeRole(role, req.query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
    private getMessagedUsersByOppositeRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = req.user as User;
            const role = currentUser.roles as Role;
            const id = (req.user as { _id: string })._id;
            
            const result = await this.userService.getUsersWithMessagesByOppositeRole(id, role, req.query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    private get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('Query Parameters:', req.query);
            const id: string = req.params.id;
            const result = await this.userService.get(id);
            res.send(result);
        } catch (error) {
            next(error);
        }
    };
    private getCurrent = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user._id;
            const result = await this.userService.get(userId);
            res.send(result);
        } catch (error) {
            next(error);
        }
    };
    private createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.body;
            const isAvatarFieldExists = !!req.file;
            let file: any = null;
            if (isAvatarFieldExists) file = req.file;
            console.log('File exists:', isAvatarFieldExists);
            const result = await this.userService.createUsers(user, file);
            res.send({ result, message: 'User created successfully!' });
        } catch (error) {
            next(error);
        }
    };

    private updateUser = async (req: any, res: Response, next: NextFunction) => {
        try {
            const user: User = req.user;
            const id: string = req.params.id;
            const data = req.body;

            const result = await this.userService.updateUser(id, data, user);
            res.send({ result, message: 'User updated successfully!' });
        } catch (error) {
            next(error);
        }
    };

    private deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id: string = req.params.id;
            await this.userService.deleteUser(id);
            res.send({
                message: `User is deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    };
    private recoverUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id: string = req.params.id;
            await this.userService.deleteUser(id);
            res.send({
                message: `User is recovered successfully`,
            });
        } catch (error) {
            next(error);
        }
    };
    private uploadFileToUserController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, resource, folder } = req.params;
            const file = req.file;

            if (!file) {
                throw new HttpException(400, 'Please upload a file');
            }

            validateAllowedResource(resource);

            const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
            validateExtension(resource, extension);

        } catch (error) {
            next(error);
        }
    };
}

export default UserController;
