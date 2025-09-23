import HttpException from '@/utils/exceptions/http.exception';
import { Role } from '@/utils/helpers/constants';
import { Response, NextFunction } from 'express';

export const hasRoles = (...roles: Role[]) => {
    return async (request: any, response: Response, next: NextFunction) => {
        if (!request.user?.roles || !roles.includes(request.user.roles)) {
            return next(new HttpException(403, 'Access Forbidden'));
        }
        return next();
    };
};
  

export const checkUserCreationPermission = async () => {
    return async (request: any, response: Response, next: NextFunction) => {
        const currentUserRole = request.user.roles;
        const newUserRole = request.body.roles;

        const allowedRoles: { [key: string]: string } = {
            [Role.COMMERCIAL_MANAGER]: Role.COMMERCIAL,
            [Role.SOURCING_MANAGER]: Role.SOURCING_SPECIALIST,
        };

        if (currentUserRole in allowedRoles) {
            if (newUserRole !== allowedRoles[currentUserRole]) {
                return next(
                    new HttpException(
                        403,
                        `Permission denied, with this role '${currentUserRole}' you can only create users with role '${allowedRoles[currentUserRole]}'`,
                    ),
                );
            }
        }
        next();
    };
};
export const excludeLoggedInUser = () => {
    return async (req: any, res: Response, next: NextFunction) => {
        if (req.user && req.user._id) {
            req.query.excludeUserId = req.user._id;
            //console.log("Excluding logged-in user ID:", req.user._id);
        }
        next();
    };
};
export const canDeleteUser = () => {
    return async (req: any, res: Response, next: NextFunction) => {
        const loggedInUser = req.user;
        if (
            loggedInUser.roles === Role.ADMIN ||
            req.body.userId === loggedInUser._id || 
            req.query.userId === loggedInUser._id ||
            req.params?.id === loggedInUser._id || 
            req.user._id === loggedInUser._id 
        ) {
            return next();
        }

        return next(new HttpException(403, 'You are not allowed to delete this account.'));
    };
};


