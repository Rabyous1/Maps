import { Response, NextFunction } from 'express';
import HttpException from '@/utils/exceptions/http.exception';
import { UserRepository } from '@/apis/user/UserRepository';

const isUserExist = async (request: any, response: Response, next: NextFunction) => {
    const userRepository = new UserRepository();
    const id: string = request.user._id;
    const user = await userRepository.findById(id);
    if (!user) {
        throw new HttpException(404, 'User Not Found');
    }

    request.user = user;
    next();
};

export default isUserExist;
