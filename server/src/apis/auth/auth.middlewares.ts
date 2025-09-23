import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { confirmAccountSchema } from './auth.validations';
import HttpException from '@/utils/exceptions/http.exception';


const resetPasswordMiddleware = async (request: Request, response: Response, next: NextFunction) => {
     const token = request.query.token as string; 
    const secretKey: any = process.env.RESET_PASSWORD_TOKEN_PRIVATE_KEY;

    jwt.verify(token, secretKey, async (err:any, decoded: any) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                next(new HttpException(400,'Token has expired'));
            } else {
                next(new HttpException(400,`Error decoding Token: ${err.message}`));
            }
        } else {
            const expirationTime = new Date(decoded.exp * 1000);

            if (expirationTime < new Date()) {
                next(new HttpException(400,'Token has expired'));
            }
            
            next();
        }
    });
};

const confirmAccountMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    const token = request.params.token;
    const { error } = confirmAccountSchema.validate({ token });
    if (error) response.status(406).json({ error: error.details[0].message });
    next();
};
const twoWayAuthMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    const { twoWayAuthEnabled} = request.body;

    if (twoWayAuthEnabled) {
        return response.status(403).json({
            message: 'Two-way authentication is enabled. Please verify to proceed.',
            redirectPath: '/verify'
        });
    }

    next();
};







export { resetPasswordMiddleware, confirmAccountMiddleware,twoWayAuthMiddleware };
