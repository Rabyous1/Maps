import crypto from 'crypto';

import { User } from '@/apis/user/interfaces/user.interfaces';
import { UserRepository } from '@/apis/user/UserRepository';
import HttpException from '@/utils/exceptions/http.exception';
import { auth } from '@/utils/services/authenticated.service';
import { sendEmail } from '@/utils/services/email-service/email.service';

class AuthSocialMediaService {
    private userRepository = new UserRepository();
    public async createUser(profile: any): Promise<User> {
        const generatedPassword = await auth.randomPassword();
        const hashedPassword = await auth.hashPassword(generatedPassword);
        const activationToken = crypto.randomBytes(20).toString('hex');
        const newUser = await this.userRepository.create({
            email: profile.emails[0].value,
            fullName: `${profile.name.givenName} ${profile.name.familyName}`,
            isVerified: true,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            password: hashedPassword,
            confirmAccountToken: activationToken,
            // profilePicture: profile.profilePicture,
            isFirstTimeLoggedIn: true,
        });
        const activationLink = `${process.env.MICROSOFT_AUTH_ACTIVATION_FRONTEND_URL}?token=${activationToken}`;

        await this.sendActivationEmail(newUser, generatedPassword, activationLink);
        return newUser;
    }
    private async sendActivationEmail(user: User, generatedPassword: string, activationLink: string): Promise<void> {
        const link = `${process.env.FRONTEND_LOGIN_URL}`;
        sendEmail({
            to: user.email,
            subject: 'Welcome to Maps',
            template: 'emailTemplate',
            context: {
                title: 'Welcome to Maps',
                backgroundImageUrl: 'https://i.ibb.co/RTH9N0C1/Login-1.png',
                cardText: 'Welcome on Board',
                fullName: user.fullName,
                paragraphs: [
                    'Welcome to Maps! We’re excited to have you join us.',
                    'A password has been generated for your account. You can log in using the following credentials and change your password for your account security :',
                    `Email address: <strong>${user.email}</strong>`,
                    `Password: <strong>${generatedPassword}</strong>`,
                ],
                buttonText: 'Sign in',
                buttonLink: link,
                signatureName: 'The Maps Team',
                companyName: 'Maps',
                year: new Date().getFullYear(),
            },
        });
    }

    public async getUser(field: any): Promise<any> {
        const user = await this.userRepository.findOne(field);
        if (!user) throw new HttpException(404, 'User Not Found.');
        return user;
    }
}
export default AuthSocialMediaService;