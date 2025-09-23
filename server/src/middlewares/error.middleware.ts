import { Request, Response, NextFunction } from 'express';
import HttpException from '@/utils/exceptions/http.exception';

function errorMiddleware(error: HttpException, _req: Request, res: Response, _next: NextFunction): void {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    const date = new Date().toJSON();
    res.status(status).send({
        status,
        message,
        date,
    });
}

export default errorMiddleware;
