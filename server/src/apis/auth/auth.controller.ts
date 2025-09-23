import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import AuthService from './auth.service';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { signUpSchema, signInSchema, forgotPasswordSchema, resetPasswordSchema, firstTimeloggedInUserSchema, chooseRoleSchema } from './auth.validations';
import { SignInRequestI, SignUpRequestI } from './auth.interfaces';
import isAuthenticated from '@/middlewares/authentication.middleware';
import { confirmAccountMiddleware, resetPasswordMiddleware, twoWayAuthMiddleware } from './auth.middlewares';
import { uploadMiddleware } from '@/middlewares/upload-file.middleware';
import { logoutHandler } from '@/utils/helpers/logout.helper';
import { emitNotification } from '@/utils/config/socket/events/emitNotification';
import { NotificationTypes } from '@/utils/helpers/constants';



declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isLoggedIn?: boolean;
  }
}

class AuthController implements Controller {
    public path = '/auth';
    public router = Router();
    private AuthService = new AuthService();
    constructor() {
        this.initialiseRoutes();
    }
    private initialiseRoutes(): void {
        this.router.post(`${this.path}/signup`, uploadMiddleware, validationMiddleware(signUpSchema), this.signUp);
        this.router.post(`${this.path}/signin`, validationMiddleware(signInSchema), twoWayAuthMiddleware, this.signIn);
        this.router.put(`${this.path}/complete-profile`, isAuthenticated, validationMiddleware(firstTimeloggedInUserSchema), this.completeProfile);
        this.router.post(`${this.path}/logout`, isAuthenticated, this.logout);
        this.router.post(`${this.path}/forgot-password`, validationMiddleware(forgotPasswordSchema), this.forgotPassword);
        this.router.post(`${this.path}/reset-password`, resetPasswordMiddleware, validationMiddleware(resetPasswordSchema), this.resetPassword);
        this.router.get(`${this.path}/confirm-account/:token`, confirmAccountMiddleware, this.confirmAccount);
        this.router.get(`${this.path}/2fa/setup`, isAuthenticated, this.generateTwoFactorSetup);
        this.router.post(`${this.path}/2fa/confirm`, isAuthenticated, this.confirmTwoFactor);
        this.router.post(`${this.path}/2fa/verify`, this.verifyTwoFactor);
        this.router.post(`${this.path}/2fa/disable`, isAuthenticated, this.disableTwoFactor);
        this.router.get(`${this.path}/2fa/status`, isAuthenticated, this.getTwoFactorStatus);

        this.router.patch(`${this.path}/choose-role`, isAuthenticated, validationMiddleware(chooseRoleSchema), this.chooseRole);
    }
    private signUp = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const signUpData: SignUpRequestI = request.body;
            const isAvatarFieldExists = !!request.file;
            let file: any = null;
            if (isAvatarFieldExists) file = request.file;

            const createdUser = await this.AuthService.signUp(signUpData, file);

            await emitNotification({
                senderId: process.env.SYSTEM_USER_ID!,
                receiverId: createdUser.id!,
                type: NotificationTypes.SYSTEM,
                content: 'Welcome to Maps, we are happy to see you here!',
            });

            response.status(201).send({
                message: `User '${signUpData.fullName}' created successfully!`,
            });
        } catch (error) {
            next(error);
        }
    };

    private signIn = async (request: any, response: Response, next: NextFunction) => {
        try {
            const signInData: SignInRequestI = request.body;
            const { user, accessToken, refreshToken, twoFactorRequired } = await this.AuthService.signIn(signInData);

            request.session.userId = user.id;

            request.session.isLoggedIn = !twoFactorRequired;

            await new Promise<void>((resolve, reject) => request.session.save((err: any) => (err ? reject(err) : resolve())));

            if (twoFactorRequired) {
                return response.status(200).json({
                    message: '2FA required',
                    twoFactorRequired: true,
                    user: {
                        id: user.id,
                        email: user.email,
                    },
                });
            }

            response.cookie('accessToken', accessToken, {
                maxAge: Number(process.env.COOKIE_MAX_AGE),
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            response.cookie('refreshToken', refreshToken, {
                maxAge: Number(process.env.COOKIE_MAX_AGE),
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            if (user.isFirstTimeLoggedIn) {
                return response.status(200).json({
                    user,
                    message: 'Please complete your profile.',
                    firstTimeLoginRequired: true,
                });
            }

            return response.status(200).json({
                user,
                message: 'Welcome back!',
            });
        } catch (error) {
            next(error);
        }
    };

    private chooseRole = async (request: any, response: Response, next: NextFunction) => {
        try {
            const userId = request.user._id;
            const { role } = request.body;

            const { user, accessToken, refreshToken } = await this.AuthService.chooseRole(userId, role);

            response.cookie('accessToken', accessToken, {
                maxAge: Number(process.env.COOKIE_MAX_AGE),
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            response.cookie('refreshToken', refreshToken, {
                maxAge: Number(process.env.COOKIE_MAX_AGE),
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            // Return user and success message
            response.status(200).json({
                message: `Role '${role}' selected successfully.`,
                user,
            });
        } catch (error) {
            next(error);
        }
    };

    private completeProfile = async (request: any, response: Response, next: NextFunction) => {
        try {
            const id: string = request.user._id;
            const completeProfileData = request.body;
            await this.AuthService.completeProfile(id, completeProfileData);
            response.send({
                message: 'Profile completed successfully and account is now verified.',
            });
        } catch (error) {
            next(error);
        }
    };
    private logout = (req: Request, res: Response, next: NextFunction) => {
        logoutHandler(req, res, next);
    };

    private forgotPassword = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const email: string = request.body.email;
            await this.AuthService.forgotPassword(email);
            response.status(200).send({
                message: `Password reset link sent to ${email}.`,
            });
        } catch (error) {
            next(error);
        }
    };
    private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const token = (request.query.token as string) || '';
            const { password } = request.body as { password?: string };

            if (!token) return response.status(400).json({ message: 'Token is required.' });
            if (!password) return response.status(400).json({ message: 'Password is required.' });

            const accountService = (this.AuthService as any).accountService;
            let userEntity: any = null;
            if (accountService && typeof accountService.getAccount === 'function') {
                try {
                    userEntity = await accountService.getAccount({ resetPasswordToken: token });
                } catch (err) {
                    userEntity = null;
                }
            }

            await this.AuthService.resetPassword(password, token);

            if (!userEntity || !userEntity.email) {
                return response.status(200).json({
                    message: 'Password reset successful. Please sign in to continue.',
                });
            }

            const signInResult = await this.AuthService.signIn({ email: userEntity.email, password });
            const { user, accessToken, refreshToken, twoFactorRequired } = signInResult;

            (request as any).session.userId = user.id ?? user._id;
            (request as any).session.isLoggedIn = !twoFactorRequired;

            await new Promise<void>((resolve, reject) => (request as any).session.save((err: any) => (err ? reject(err) : resolve())));

            if (twoFactorRequired) {
                return response.status(200).json({
                    message: '2FA required',
                    twoFactorRequired: true,
                    user: { id: user.id ?? user._id, email: user.email },
                });
            }

            const cookieOptions = {
                maxAge: Number(process.env.COOKIE_MAX_AGE),
                httpOnly: true,
                sameSite: 'lax' as const,
                secure: process.env.NODE_ENV === 'production',
            };

            response.cookie('accessToken', accessToken, cookieOptions);
            response.cookie('refreshToken', refreshToken, cookieOptions);

            if (user.isFirstTimeLoggedIn) {
                return response.status(200).json({
                    user,
                    message: 'Please complete your profile.',
                    firstTimeLoginRequired: true,
                });
            }

            return response.status(200).json({
                user,
                message: 'Password reset successful. User logged in.',
            });
        } catch (error) {
            next(error);
        }
    };

    private confirmAccount = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { token } = request.params;
            await this.AuthService.confirmAccount(token);
            response.status(200).send({
                message: 'Account confirmed successfully',
            });
        } catch (error) {
            next(error);
        }
    };

    private generateTwoFactorSetup = async (request: any, response: Response, next: NextFunction) => {
        try {
            const userId = request.user._id;
            const { qrCodeDataURL } = await this.AuthService.enableTwoFactor(userId);
            response.status(200).send({ qrCodeDataURL });
        } catch (error) {
            next(error);
        }
    };
    private confirmTwoFactor = async (request: any, response: Response, next: NextFunction) => {
        try {
            const userId = request.user._id;
            const { token } = request.body;
            await this.AuthService.confirmTwoFactor(userId, token);
            response.status(200).send({ message: 'Two-factor authentication enabled' });
        } catch (error) {
            next(error);
        }
    };

    private verifyTwoFactor = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { otpCode } = request.body;
            const userId = request.session.userId;

            if (!otpCode) {
                return response.status(400).json({ message: 'Missing OTP code' });
            }

            if (!userId) {
                return response.status(401).json({ message: 'Unauthorized. No session userId found.' });
            }

            const result = await this.AuthService.verifyTwoFactor(userId, otpCode);

            response.cookie('accessToken', result.accessToken, {
                maxAge: Number(process.env.COOKIE_MAX_AGE),
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            response.cookie('refreshToken', result.refreshToken, {
                maxAge: Number(process.env.COOKIE_MAX_AGE),
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            request.session.isLoggedIn = true;
            await new Promise<void>((resolve, reject) => request.session.save((err: any) => (err ? reject(err) : resolve())));

            return response.status(200).json({
                user: result.user,
                message: '2FA verified, tokens updated',
            });
        } catch (error) {
            next(error);
        }
    };

    private disableTwoFactor = async (request: any, response: Response, next: NextFunction) => {
        try {
            const userId = request.user._id;
            await this.AuthService.disableTwoFactor(userId);
            response.status(200).send({ message: 'Two-factor authentication disabled' });
        } catch (error) {
            next(error);
        }
    };

    private getTwoFactorStatus = async (request: any, response: Response, next: NextFunction) => {
        try {
            const userId = request.user._id;
            const isEnabled = await this.AuthService.getTwoFactorStatus(userId);
            response.status(200).json({ enabled: isEnabled });
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;