import { Request, Response, NextFunction } from 'express';

export function logoutHandler(req: Request, res: Response, next: NextFunction, message: string = 'User logged out successfully') {
    req.session.destroy(err => {
        if (err) return next(err);
        res.clearCookie('connect.sid', { domain: 'localhost' });
        res.clearCookie('refreshToken', { domain: 'localhost' });
        res.clearCookie('accessToken', { domain: 'localhost' });
        res.send({ message });
    });
}
