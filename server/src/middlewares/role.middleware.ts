import { Request, Response, NextFunction } from 'express';
import { Role } from '@/utils/helpers/constants';
import HttpException from '@/utils/exceptions/http.exception';

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.roles;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    next();
  };
};

export function getOppositeRole(role: Role): Role {
  switch (role) {
    case Role.RECRUTEUR:
      return Role.CANDIDAT;
    case Role.CANDIDAT:
      return Role.RECRUTEUR;
    default:
      throw new HttpException(404, 'Invalid user role for this operation.');
  }
}

export function restrictToOwner<T extends Record<string, any>>(
    fetchById: (id: string) => Promise<T | null>,
    idParam: string = 'id',
    ownerField: keyof T = 'createdBy' as keyof T,
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new HttpException(401, 'You must be logged in');

            const resourceId = req.params[idParam];
            const resource = await fetchById(resourceId);
            if (!resource) throw new HttpException(404, 'Resource not found');

            if (resource[ownerField] !== userId) {
                throw new HttpException(403, 'You do not own this resource');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
