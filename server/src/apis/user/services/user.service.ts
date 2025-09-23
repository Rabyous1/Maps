import HttpException from '@/utils/exceptions/http.exception';
import { auth } from '@/utils/services';
import crypto from 'crypto';
import { sendEmail } from '@/utils/services';
import { ILike, Not } from 'typeorm';
import { UserRepository } from '../UserRepository';
import { User } from '../interfaces/user.interfaces';
import { Role } from '@/utils/helpers/constants';

import { getOppositeRole } from '@/middlewares/role.middleware';
import { GroupRepository } from '@/apis/messages/groups/groups.repository';
import { computeCandidateStats } from '@/utils/helpers/candidate.helpers';
import { CandidateUser } from '../interfaces/candidate.interfaces';

class UserService {
    private readonly userRepository = new UserRepository();
    private readonly groupRepository = new GroupRepository();

    // public async getAll(queries: any): Promise<any> {
    //     const { roles, fullName, country, isArchived, paginated, excludeUserId } = queries;
    //     const pageNumber = Number(queries.pageNumber) || 1;
    //     const pageSize = Number(queries.pageSize) || 10;
    //     const where: any = {};
    //     where.isArchived = isArchived !== undefined ? isArchived : false;

    //     if (roles) where.roles = ILike(`%${roles}%`);
    //     if (fullName) where.fullName = ILike(`%${fullName}%`);
    //     if (country) where.country = country;
    //     if (excludeUserId) where.id = Not(excludeUserId);

    //     if (paginated) {
    //         const users = await this.userRepository.repository.find({
    //             where,
    //             order: { createdAt: 'DESC' },
    //         });
    //         return { totalUsers: users.length, users };
    //     } else {
    //         const [users, totalUsers] = await this.userRepository.repository.findAndCount({
    //             where,
    //             order: { createdAt: 'DESC' },
    //             skip: (pageNumber - 1) * pageSize,
    //             take: pageSize,
    //         });
    //         return {
    //             pageNumber,
    //             pageSize,
    //             totalPages: Math.ceil(totalUsers / pageSize),
    //             totalUsers,
    //             users,
    //         };
    //     }
    // }
    public async getAll(queries: any): Promise<any> {
        const { roles, fullName, country, isArchived, paginated, excludeUserId } = queries;
        const pageNumber = Number(queries.pageNumber) || 1;
        const pageSize = Number(queries.pageSize) || 10;

        const where: any = {};

        // Only filter by isArchived if explicitly provided
        if (isArchived !== undefined) {
            where.isArchived = isArchived;
        }

        if (roles) where.roles = ILike(`%${roles}%`);
        if (fullName) where.fullName = ILike(`%${fullName}%`);
        if (country) where.country = country;
        if (excludeUserId) where.id = Not(excludeUserId);

        if (paginated) {
            const users = await this.userRepository.repository.find({
                where,
                order: { createdAt: 'DESC' },
            });
            return { totalUsers: users.length, users };
        } else {
            const [users, totalUsers] = await this.userRepository.repository.findAndCount({
                where,
                order: { createdAt: 'DESC' },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
            });
            return {
                pageNumber,
                pageSize,
                totalPages: Math.ceil(totalUsers / pageSize),
                totalUsers,
                users,
            };
        }
    }

    async getAllUserIds(): Promise<string[]> {
        const users = await this.userRepository.repository.createQueryBuilder('user').select('user.id', 'id').getRawMany();

        return users.map(user => user.id);
    }
    public async getLastSeenFromDb(userId: string): Promise<string | null> {
        const user = await this.userRepository.findById(userId);
        return user?.lastSeen ? user.lastSeen.toISOString() : null;
    }
    async updateLastSeen(userId: string, lastSeen: string) {
        await this.userRepository.findByIdAndUpdate(userId, { lastSeen: new Date(lastSeen) });
    }
    public async getTopFrequentMessagedUsers(currentUserId: string, currentUserRole: Role) {
        const roleToFetch = getOppositeRole(currentUserRole);

        const qb = this.userRepository.repository
            .createQueryBuilder('user')
            .innerJoin(
                'message',
                'message',
                `
              (message.senderId   = :currentUserId AND message.receiverId = user.id)
              OR
              (message.receiverId = :currentUserId AND message.senderId   = user.id)
            `,
                { currentUserId },
            )
            .where('user.roles = :roleToFetch', { roleToFetch })
            .select('user')
            .addSelect('COUNT(message.id)', 'messagecount')
            .groupBy('user.id')
            .addGroupBy('user.fullName')
            .orderBy('messagecount', 'DESC')
            .limit(5);

        const rows = await qb.getRawMany();
        return rows.map(r => ({
            id: r.user_id,
            fullName: r.user_fullName,
            email: r.user_email,
            profilePicture: r.user_profilePicture,
            messageCount: Number(r.messagecount),
        }));
    }

    async getUsersByOppositeRole(currentUserRole: Role, queries: { pageNumber?: string; pageSize?: string; search?: string }) {
        const pageNumber = Number(queries.pageNumber) || 1;
        const pageSize = Number(queries.pageSize) || 10;
        const search = queries.search?.trim() || '';
        const roleToFetch = getOppositeRole(currentUserRole);

        const qb = this.userRepository.repository.createQueryBuilder('user').where('user.roles = :role', { role: roleToFetch });

        if (search) {
            qb.andWhere('LOWER(user.fullName) LIKE LOWER(:search)', {
                search: `%${search}%`,
            });
        }

        const [users, totalUsers] = await qb
            .orderBy('user.createdAt', 'DESC')
            .skip((pageNumber - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();

        return {
            pageNumber,
            pageSize,
            totalPages: Math.ceil(totalUsers / pageSize),
            totalUsers,
            users,
        };
    }

    async getUsersWithMessagesByOppositeRole(
        currentUserId: string,
        currentUserRole: Role,
        queries: { pageNumber?: string; pageSize?: string; search?: string },
    ) {
        const pageNumber = Number(queries.pageNumber) || 1;
        const pageSize = Number(queries.pageSize) || 10;
        const search = queries.search?.trim().toLowerCase() || '';
        const roleToFetch = getOppositeRole(currentUserRole);

        let userQb = this.userRepository.repository
            .createQueryBuilder('user')
            .innerJoin(
                'message',
                'message',
                `
              (message.senderId = :currentUserId AND message.receiverId = user.id)
              OR
              (message.receiverId = :currentUserId AND message.senderId = user.id)
            `,
                { currentUserId },
            )
            .where('user.roles = :roleToFetch', { roleToFetch })
            .select([
                'user.id AS "id"',
                'user.fullName AS "fullName"',
                'user.email AS "email"',
                'user.profilePicture AS "profilePicture"',
                'user.lastSeen AS "lastSeen"',
                `'user' AS "type"`,
                'MAX(message."createdAt") AS "lastMessageDate"',
            ])
            .groupBy('user.id');

        if (search) {
            userQb = userQb.andWhere('LOWER(user.fullName) LIKE :search', {
                search: `%${search}%`,
            });
        }

        const usersRaw = await userQb.getRawMany();

        const groupQb = this.groupRepository.repository
            .createQueryBuilder('grp')
            .innerJoin('grp.members', 'memberFilter', 'memberFilter.id = :currentUserId', { currentUserId })
            .innerJoin('message', 'message', 'message."groupId" = grp.id')
            .leftJoin('grp.members', 'member')
            .select([
                'grp.id AS "id"',
                `COALESCE(grp.name, 'Group Chat') AS "name"`,
                `'group' AS "type"`,
                'NULL AS "profilePicture"',
                'MAX(message."createdAt") AS "lastMessageDate"',
                `json_agg(DISTINCT jsonb_build_object(
                'id', member.id,
                'fullName', member.fullName,
                'email', member.email,
                'profilePicture', member."profilePicture",
                'lastSeen', member."lastSeen"
                )) AS "members"`,
            ])
            .groupBy('grp.id');

        if (search) {
            groupQb.andWhere(
                `(
                    LOWER(grp.name) LIKE :search
                    OR EXISTS (
                      SELECT 1
                      FROM "group_members" gm
                      JOIN "user" u ON u.id = gm."userId"
                      WHERE gm."groupId" = grp.id
                      AND LOWER(u."fullName") LIKE :search
                    )
                  )`,
                { search: `%${search}%` },
            );
        }

        const groupsRaw = await groupQb.getRawMany();

        const combined = [...usersRaw, ...groupsRaw].sort((a, b) => {
            const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
            const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;

            return dateB - dateA;
        });

        const totalCombined = combined.length;
        const totalPages = Math.ceil(totalCombined / pageSize);
        const paginated = combined.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

        return {
            pageNumber,
            pageSize,
            totalPages,
            totalResults: totalCombined,
            items: paginated,
        };
    }
    public async createUsers(user: any, file: any): Promise<void> {
        const oldUser = await this.userRepository.findByEmail(user.email);
        if (oldUser) throw new HttpException(409, 'Email must be unique');

        const password = await auth.randomPassword();
        const hashedPassword = await auth.hashPassword(password);
        const token = crypto.randomBytes(20).toString('hex');

        const newUser = await this.userRepository.create({
            ...user,
            password: hashedPassword,
            confirmAccountToken: token,
            profilePicture: file ? file.path : null,
        });
        // if it's a candidate, compute & persist stats
        if (newUser.roles === Role.CANDIDAT) {
            const stats = computeCandidateStats(newUser as CandidateUser);
            Object.assign(newUser, stats);
            await this.userRepository.save(newUser);
        }
        const link = `${process.env.CONFIRM_ACCOUNT_URL_FRONT}/${token}`;
        sendEmail({
            to: user.email,
            subject: 'Confirmer votre compte',
            template: 'emailTemplate',
            context: {
                title: 'Bienvenue sur Maps',
                backgroundImageUrl: 'https://i.ibb.co/RTH9N0C1/Login-1.png',
                cardText: 'Welcome on board',
                fullName: user.fullName,
                paragraphs: [
                    'Bienvenue sur Maps ! Nous sommes ravis de vous accueillir parmi nous.',
                    'Merci de confirmer votre compte afin qu’il soit activé.',
                ],
                buttonText: 'Confirmer',
                buttonLink: link,
                signatureName: 'Équipe Maps',
                companyName: 'Maps',
                year: new Date().getFullYear(),
            },
        });
    }
    public async deleteUser(id: string): Promise<void> {
        const oldUser = await this.userRepository.findById(id);
        if (!oldUser) throw new HttpException(404, 'Resource Not Found');
        oldUser.isArchived = !oldUser.isArchived;
        await this.userRepository.save(oldUser);
    }

    public async updateUser(id: string, userData: any, currentUser: User): Promise<void> {
        const existingUser = await this.get(id);

        Object.assign(existingUser, userData);
        // recompute stats any time candidate profile data changes
        if (existingUser.roles === Role.CANDIDAT) {
            const stats = computeCandidateStats(existingUser as CandidateUser);
            Object.assign(existingUser, stats);
        }
        await this.userRepository.save(existingUser);
    }

    public async get(id: string): Promise<any> {
        const user = await this.userRepository.findById(id);
        if (!user) throw new HttpException(404, 'User Not Found.');
        return user;
    }
}

export default UserService;
