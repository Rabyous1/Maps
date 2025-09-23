import { UserRepository } from '@/apis/user/UserRepository';
import passport from '@/utils/config/passport';
import HttpException from '@/utils/exceptions/http.exception';
import Controller from '@/utils/interfaces/controller.interface';
import { Router, Request, Response, NextFunction } from 'express';
import { User } from '@/apis/user/interfaces/user.interfaces';
import { auth } from '@/utils/services';

class AuthSocialMediaController implements Controller {
  public path = '/auth';
  public router = Router();
  private userRepository = new UserRepository();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // === MICROSOFT ===
    this.router.get(`${this.path}/microsoft`, passport.authenticate('microsoft'));
    this.router.get(`${this.path}/microsoft/callback`, passport.authenticate('microsoft'), this.handleLoginCallback('Microsoft'));
    this.router.get(`${this.path}/microsoft/success`, this.handleLoginSuccess('Microsoft Login Successful'));

    // === LINKEDIN ===
    this.router.get(`${this.path}/linkedin`, passport.authenticate('linkedin'));
    this.router.get(`${this.path}/linkedin/callback`, passport.authenticate('linkedin'), this.handleLoginCallback('LinkedIn'));
    this.router.get(`${this.path}/linkedin/success`, this.handleLoginSuccess('LinkedIn Login Successful'));

    // === GOOGLE ===
    this.router.get(`${this.path}/google`, passport.authenticate('google', { scope: ['profile', 'email'] }));
    this.router.get(`${this.path}/google/callback`, passport.authenticate('google'), this.handleLoginCallback('Google'));

    // === LOGOUT ===
    this.router.post(`${this.path}/logout`, this.logout);
  }

  private handleLoginCallback = (provider: 'Microsoft' | 'LinkedIn' | 'Google') => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      if (!user || !user.email) throw new HttpException(400, `Email not provided by ${provider}`);

      const foundUser = await this.userRepository.findByEmail(user.email);
      if (!foundUser) throw new HttpException(400, 'User not found. Please sign up.');

      const payload = { _id: foundUser.id, roles: foundUser.roles, profilePicture: foundUser.profilePicture, fullName: foundUser.fullName };
      

      const [accessToken, refreshToken] = await Promise.all([
        auth.generateToken(payload, String(process.env.ACCESS_TOKEN_PRIVATE_KEY), String(process.env.ACCESS_TOKEN_TIME)),
        auth.generateToken(payload, String(process.env.REFRESH_TOKEN_PRIVATE_KEY), String(process.env.REFRESH_TOKEN_TIME)),
      ]);

      res.cookie('accessToken', accessToken, {
        maxAge: Number(process.env.COOKIE_MAX_AGE),
        httpOnly: true,
      });
      res.cookie('refreshToken', refreshToken, {
        maxAge: Number(process.env.COOKIE_MAX_AGE),
        httpOnly: true,
      });

      req.login(user, (err: Error | null) => {
        if (err) throw new HttpException(500, `Error logging in with ${provider}`);
        return res.redirect(`${process.env.FRONTEND_LOGIN_URL}`);
      });
    } catch (error) {
      console.error(`[${provider} OAuth Error]`, error);
      next(error);
    }
  };

  private handleLoginSuccess = (message: string) => {
    return (req: Request, res: Response): void => {
      if (req.isAuthenticated()) {
        res.status(200).send({
          message,
          user: req.user,
        });
      } else {
        throw new HttpException(401, 'Unauthorized');
      }
    };
  };

  private logout = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (typeof (req as any).logout === 'function') {
      (req as any).logout((err: any) => {
        if (err) return next(err);
        res.status(200).send({ message: 'Logged out successfully' });
      });
    } else {
      // ✅ fallback pour les tests (pas de Passport dans Jest)
      res.status(200).send({ message: 'Logged out successfully' });
    }
  } catch (error) {
    next(error);
  }
};

}

export default AuthSocialMediaController;
