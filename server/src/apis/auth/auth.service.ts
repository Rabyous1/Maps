import crypto from 'crypto';
import { SignInRequestI, SignUpRequestI } from './auth.interfaces';
import { auth, sendEmail } from '@/utils/services';
import HttpException from '@/utils/exceptions/http.exception';
import AccountService from '../user/services/account.service';
import { UserRepository } from '../user/UserRepository';
import { Role } from '@/utils/helpers/constants';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { User } from '../user/interfaces/user.interfaces';

class AuthService {
    private readonly userRepository = new UserRepository();
    private readonly accountService = new AccountService();

    public async getByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new HttpException(404, 'User not found.');
        return user;
    }
    public async signUp(signUpData: SignUpRequestI, file: any): Promise<User> {
        const { fullName, email, password } = signUpData;

        const userExists = await this.userRepository.findByEmail(email);
        if (userExists) throw new HttpException(406, 'This email already exists');

        const hashedPassword = await auth.hashPassword(password);
        const token = crypto.randomBytes(20).toString('hex');

        const newUser: Partial<User> = {
            ...signUpData,
            password: hashedPassword,
            confirmAccountToken: token,
            profilePicture: file?.path || null,
        };

        const createdUser = await this.userRepository.create(newUser);
        await this.userRepository.save(createdUser);

        const link = `${process.env.CONFIRM_ACCOUNT_URL_FRONT}/${token}`;
        await sendEmail({
            to: email,
            subject: 'Confirm Your Account',
            template: 'emailTemplate',
            context: {
                title: 'Welcome to Maps',
                backgroundImageUrl: 'https://i.ibb.co/RTH9N0C1/Login-1.png',
                cardText: 'Welcome on Board',
                fullName: fullName,
                paragraphs: ['Welcome to Maps! We’re excited to have you with us.', 'Please confirm your account to activate it.'],
                buttonText: 'Confirm',
                buttonLink: link,
                signatureName: 'The Maps Team',
                companyName: 'Maps',
                year: new Date().getFullYear(),
            },
        });

        return createdUser;
    }

    public async signIn(signInData: SignInRequestI): Promise<any> {
        const { email, password } = signInData;
        const user = await this.getByEmail(email);
        console.log('Utilisateur récupéré:', user);

        const isMatched = await auth.comparePassword(password, user.password);
        if (!isMatched) {
            throw new HttpException(401, 'Incorrect password');
        }

        if (user.isArchived) {
            throw new HttpException(403, "You can't sign in because your account is deleted");
        }
        // if (user.isVerified == false) {
        //     throw new HttpException(403, "You can't sign in because your account is not activated, please check your email and activate it.");
        // }

        const payload = { _id: user.id, roles: user.roles, profilePicture: user.profilePicture, fullName: user.fullName };

        const [accessToken, refreshToken] = await Promise.all([
            auth.generateToken(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY!, process.env.ACCESS_TOKEN_TIME!),
            auth.generateToken(payload, process.env.REFRESH_TOKEN_PRIVATE_KEY!, process.env.REFRESH_TOKEN_TIME!),
        ]);

        return {
            user,
            accessToken,
            refreshToken,
            twoFactorRequired: user.twoFactorEnabled,
        };
    }

    public async chooseRole(
        userId: string,
        role: Role.CANDIDAT | Role.RECRUTEUR,
    ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new HttpException(404, 'User not found.');
        }

        if (!user.isFirstTimeLoggedIn) {
            throw new HttpException(400, 'Role already chosen.');
        }

        user.roles = role;
        user.isFirstTimeLoggedIn = false;
        await this.userRepository.save(user);

        const payload = { _id: user.id, roles: user.roles, profilePicture: user.profilePicture, fullName: user.fullName };
        const [accessToken, refreshToken] = await Promise.all([
            auth.generateToken(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY!, process.env.ACCESS_TOKEN_TIME!),
            auth.generateToken(payload, process.env.REFRESH_TOKEN_PRIVATE_KEY!, process.env.REFRESH_TOKEN_TIME!),
        ]);

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    public async completeProfile(id: string, completeProfileData: any): Promise<void> {
        const user = await this.userRepository.findById(id);
        console.log('completeProfile pour id:', id, 'avec données:', completeProfileData);
        const { currentPassword, newPassword, phone, country, dateOfBirth } = completeProfileData;

        if (!user) {
            throw new HttpException(404, 'User not found.');
        }

        const isMatched = await auth.comparePassword(currentPassword, user.password);
        if (!isMatched) throw new HttpException(406, 'Not Acceptable Data - Current password is incorrect');

        user.password = await auth.hashPassword(newPassword);
        user.phone = phone;
        user.country = country;
        user.dateOfBirth = dateOfBirth;

        await this.userRepository.save(user);

        user.isFirstTimeLoggedIn = false;
        user.isVerified = true;
        await this.userRepository.save(user);
    }

    public async forgotPassword(email: string): Promise<void> {
        const user = await this.getByEmail(email);

        const payload = { _id: user.id, roles: user.roles, profilePicture: user.profilePicture, fullName: user.fullName };

        const token = await auth.generateToken(
            payload,
            String(process.env.RESET_PASSWORD_TOKEN_PRIVATE_KEY),
            String(process.env.RESET_PASSWORD_TIME),
        );
        user.resetPasswordToken = token;

        await this.userRepository.save(user);

        sendEmail({
            to: user.email,
            subject: 'Reset Your Password',
            template: 'emailTemplate',
            context: {
                title: 'Password Reset',
                backgroundImageUrl: 'https://i.ibb.co/Kct4kRbX/resetpasword.png',
                cardText: 'Password Reset',
                fullName: user.fullName,
                paragraphs: [
                    'You’re receiving this email because we received a request to reset the password for your account.',
                    'If you did not request a password reset, no further action is required.',
                ],
                buttonText: 'Reset Password',
                buttonLink: `${process.env.RESET_PASSWORD_URL_FRONT}?token=${token}`,
                signatureName: 'The Maps Team',
                companyName: 'Maps',
                year: new Date().getFullYear(),
            },
        });
    }

    public resetPassword = async (password: string, token: string) => {
        await this.accountService.resetPassword(token, password);
    };

    public async confirmAccount(token: string): Promise<void> {
        const user = await this.userRepository.findOne({ confirmAccountToken: token });
        if (!user) {
            throw new HttpException(404, 'Invalid or expired confirmation token');
        }
        user.confirmAccountToken = null;
        user.isVerified = true;
        await this.userRepository.save(user);
    }

    public async verifyTwoFactor(userId: string, otpCode: string): Promise<any> {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.twoFactorSecret) {
            throw new HttpException(404, 'User not found or 2FA not enabled');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otpCode,
        });

        if (!verified) {
            throw new HttpException(401, 'Invalid OTP code');
        }
        const payloadToEncode = { _id: user.id, roles: user.roles, profilePicture: user.profilePicture, fullName: user.fullName };

        const [accessToken, refreshToken] = await Promise.all([
            auth.generateToken(payloadToEncode, process.env.ACCESS_TOKEN_PRIVATE_KEY!, process.env.ACCESS_TOKEN_TIME!),
            auth.generateToken(payloadToEncode, process.env.REFRESH_TOKEN_PRIVATE_KEY!, process.env.REFRESH_TOKEN_TIME!),
        ]);

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    public async enableTwoFactor(userId: string): Promise<{ otpauthUrl: string; qrCodeDataURL: string }> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new HttpException(404, 'User not found.');

        const secret = speakeasy.generateSecret({
            name: `${process.env.APP_NAME || 'Maps'} (${user.email})`,
        });

        user.twoFactorSecret = secret.base32;
        user.twoFactorEnabled = false;
        await this.userRepository.save(user);

        const otpauthUrl = secret.otpauth_url;
        if (!otpauthUrl) {
            throw new HttpException(500, 'Failed to generate OTP Auth URL.');
        }

        const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);

        return { otpauthUrl, qrCodeDataURL };
    }

    public async confirmTwoFactor(userId: string, token: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.twoFactorSecret) throw new HttpException(404, 'User not found or 2FA not setup.');

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
        });

        if (!verified) {
            throw new HttpException(401, 'Invalid authentication code');
        }

        user.twoFactorEnabled = true;
        await this.userRepository.save(user);
    }
    public async disableTwoFactor(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.twoFactorSecret) throw new HttpException(404, 'User not found or 2FA not setup');

        user.twoFactorSecret = null;
        user.twoFactorEnabled = false;
        await this.userRepository.save(user);
    }

    public async getTwoFactorStatus(userId: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new HttpException(404, 'User not found');
        return user.twoFactorEnabled ?? false;
    }
}

export default AuthService;