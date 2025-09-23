
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../apis/user/UserRepository';
import HttpException from '@/utils/exceptions/http.exception';

const userRepo = new UserRepository();

export const userExists = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?._id;

    if (!userId) {
      throw new HttpException(401, 'Utilisateur non authentifié');
    }

    const foundUser = await userRepo.findById(userId);

    if (!foundUser) {
      throw new HttpException(404, 'Utilisateur non trouvé');
    }

    next();
  } catch (error) {
    next(error);
  }
};
