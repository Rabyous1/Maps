import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '@/utils/exceptions/http.exception';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieToken = req.cookies?.accessToken;
    const headerToken = req.headers['authorization']?.split(' ')[1];
    const token = cookieToken || headerToken;

    if (!token) {
      throw new HttpException(401, 'Unauthorized: No token provided');
    }
const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY as string);
console.log('Decoded token:', decoded); 
(req as any).user = decoded;


    next();
  } catch (err: any) {
    console.error('JWT error:', err?.message);
    next(new HttpException(401, 'Unauthorized: Invalid token'));
  }
};



export { isAuthenticated };