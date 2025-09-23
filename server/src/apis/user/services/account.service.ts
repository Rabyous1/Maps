import HttpException from '@/utils/exceptions/http.exception';
import { auth } from '@/utils/services';
import { UserRepository } from '../UserRepository';

class AccountService {
    private readonly userRepository = new UserRepository();
    public async revealFiscal(userId: string, plainPassword: string): Promise<string | null> {
        const accountWithPassword = await this.userRepository.repository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!accountWithPassword) {
            return null;
        }

        const isMatched = await auth.comparePassword(plainPassword, accountWithPassword.password);
        if (!isMatched) {
            return null;
        }

        return (accountWithPassword as any).fiscalNumber ?? null;
    }

    public async getAccount(field: any): Promise<any> {
        console.log('[AccountService][getAccount] Called with field:', field);

        const user = await this.userRepository.findOne(field);
        if (!user) {
            console.warn('[AccountService][getAccount] User not found for field:', field);
            throw new HttpException(404, 'User Not Found.');
        }

        const userObject = (user as any).toObject?.() || user;
        const role = (userObject.roles || '').toUpperCase();

        console.log('[AccountService][getAccount] Found user with role:', role);
        delete (userObject as any).password;
        delete (userObject as any).resetPasswordToken;
        delete (userObject as any).confirmAccountToken;
        delete (userObject as any).twoFactorSecret;

        const sortByStartDate = (array: any[], key: string): any[] => {
            return [...array].sort((a, b) => {
                const dateA = new Date(a.startDate || '1900-01-01').getTime();
                const dateB = new Date(b.startDate || '1900-01-01').getTime();
                return dateB - dateA;
            });
        };

        const baseFields = {
            id: userObject.id,
            fullName: userObject.fullName,
            email: userObject.email,
            profilePicture: userObject.profilePicture,
            country: userObject.country,
            phone: userObject.phone,
            isVerified: userObject.isVerified,
            isArchived: userObject.isArchived,
            isFirstTimeLoggedIn: userObject.isFirstTimeLoggedIn,
            createdAt: userObject.createdAt,
            updatedAt: userObject.updatedAt,
            roles: userObject.roles,
            dateOfBirth: userObject.dateOfBirth,
        };

        if (role === 'CANDIDAT') {
            console.log('[AccountService][getAccount] Mapping candidate fields');
            const candidateData = {
                targetRole: userObject.targetRole,
                skills: userObject.skills,
                education: Array.isArray(userObject.education) ? sortByStartDate(userObject.education, 'education') : userObject.education,
                professionalExperience: Array.isArray(userObject.professionalExperience)
                    ? sortByStartDate(userObject.professionalExperience, 'professionalExperience')
                    : userObject.professionalExperience,
                certification: Array.isArray(userObject.certification)
                    ? sortByStartDate(userObject.certification, 'certification')
                    : userObject.certification,
                industry: userObject.industry,
                languages: userObject.languages,
                nationalities: userObject.nationalities,
                monthsOfExperiences: userObject.monthsOfExperiences,
                numberOfCertifications: userObject.numberOfCertifications,
                numberOfEducations: userObject.numberOfEducations,
                numberOfSkills: userObject.numberOfSkills,
                numberOfExperiences: userObject.numberOfExperiences,
                numberOfLanguages: userObject.numberOfLanguages,
                summary: userObject.summary,
                status: userObject.status,
                cvUrl: userObject.cvUrl,
                cvVideoUrl: userObject.cvVideoUrl,
                files: userObject.files ?? [],
                linkedinLink: userObject.linkedinLink
            };

            return { ...baseFields, ...candidateData };
        }

        if (role === 'RECRUTEUR') {
            console.log('[AccountService][getAccount] Mapping recruiter fields');

            const sanitizeFiles = (files: any[] = []) => {
                return files.map(file => {
                    const sanitized = { ...file };
                    if (sanitized.candidate && typeof sanitized.candidate === 'object') {
                        const cand = { ...sanitized.candidate };
                        delete (cand as any).password;
                        delete (cand as any).resetPasswordToken;
                        delete (cand as any).confirmAccountToken;
                        delete (cand as any).twoFactorSecret;
                        sanitized.candidate = cand;
                    }
                    return sanitized;
                });
            };

            const recruiterData = {
                position: userObject.position,
                department: userObject.department,
                companyName: userObject.companyName,
                companyWebsite: userObject.companyWebsite,
                companySize: userObject.companySize,
                recruiterSummary: userObject.recruiterSummary,
                legalStatus: userObject.legalStatus,
                files: sanitizeFiles(userObject.files ?? []),
            };

            return { ...baseFields, ...recruiterData };
        }

        console.log('[AccountService][getAccount] Returning base fields for role:', role);
        return baseFields;
    }

    public async update(accountData: any, id: string): Promise<void> {
        const existingUser = await this.getAccount({ id });

        await this.userRepository.findByIdAndUpdate(id, accountData, { new: true });
    }

    public async updatePassword(updatePasswordData: any, id: string): Promise<void> {
        const { currentPassword, newPassword } = updatePasswordData;

        const accountWithPassword = await this.userRepository.repository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :id', { id })
            .getOne();

        if (!accountWithPassword) {
            throw new HttpException(404, 'User not found');
        }

        const isMatched = await auth.comparePassword(currentPassword, accountWithPassword.password);
        if (!isMatched) {
            throw new HttpException(406, 'Not Acceptable Data - Current password is incorrect');
        }

        accountWithPassword.password = await auth.hashPassword(newPassword);
        await this.userRepository.repository.save(accountWithPassword);
    }

    public async resetPassword(token: string, password: string): Promise<void> {
        const user = await this.getAccount({ resetPasswordToken: token });
        if (!user) throw new HttpException(400, 'Invalid token');
        user.password = await auth.hashPassword(password);
        user.resetPasswordToken = null;
        await this.userRepository.save(user);
    }
    public async deleteAccount(id: string): Promise<void> {
        const oldUser = await this.userRepository.findById(id);
        if (!oldUser) throw new HttpException(404, 'Resource Not Found');
        oldUser.isArchived = !oldUser.isArchived;
        await this.userRepository.save(oldUser);
    }

    public async markAccountAsCompleted(id: string): Promise<void> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        user.isCompleted = true;
        await this.userRepository.save(user);
    }
}


export default AccountService;