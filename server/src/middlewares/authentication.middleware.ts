import { Request, Response, NextFunction } from 'express';
import { auth } from '@/utils/services';

const isAuthenticated = async (request: any, response: Response, next: NextFunction) => {
  try {
    // 🚨 Bypass en environnement test
    if (process.env.NODE_ENV === 'test') {
      request.user = { _id: 'fakeUserId', roles: ['USER'] }; 
      return next();
    }

    const { accessToken, refreshToken } = request.cookies;
    if (!accessToken || !refreshToken) {
      return response.status(401).json({ message: 'Unauthorized: Missing tokens' });
    }

    const { payload, expired } = await auth.verifyToken(
      accessToken,
      String(process.env.ACCESS_TOKEN_PRIVATE_KEY)
    );

    if (payload) {
      request.user = payload;
      return next();
    }

    if (expired && refreshToken) {
      const { payload: refresh } = await auth.verifyToken(
        refreshToken,
        String(process.env.REFRESH_TOKEN_PRIVATE_KEY)
      );

      if (refresh) {
        const newAccessToken = await auth.generateToken(
            { _id: (refresh as any)._id, roles: (refresh as any).roles },
          String(process.env.ACCESS_TOKEN_PRIVATE_KEY),
          String(process.env.ACCESS_TOKEN_TIME)
        );

        response.cookie('accessToken', newAccessToken, {
          maxAge: Number(process.env.COOKIE_MAX_AGE),
          httpOnly: true,
        });

        request.user = (
          await auth.verifyToken(newAccessToken, String(process.env.ACCESS_TOKEN_PRIVATE_KEY))
        ).payload;

        return next();
      }
    }

    return response.status(401).json({ message: 'Unauthorized: Invalid token' });
  } catch (err: any) {
    console.error('Auth error:', err.message);
    return response.status(401).json({ message: 'Unauthorized: Auth error' });
  }
};

export default isAuthenticated;
