import { EntitySchema } from 'typeorm';
import { Countries, Role } from '@/utils/helpers/constants';
import { User } from '../interfaces/user.interfaces';

export const BaseUserEntitySchema = new EntitySchema<User>({
    name: 'User',
    tableName: 'user',
    inheritance: { pattern: 'STI', column: 'type' },
    columns: {
        id: { type: 'uuid', primary: true, generated: 'uuid' },
        fullName: { type: 'varchar', length: 255 },
        dateOfBirth: { type: 'varchar', length: 255, nullable: true },
        profilePicture: { type: 'varchar', nullable: true },
        email: { type: 'varchar', unique: true },
        country: { type: 'enum', enum: Countries, nullable: true },
        password: { type: 'varchar' },
        phone: { type: 'varchar', nullable: true, default: '' },
        roles: {
            type: 'enum',
            enum: Role,
            default: null,
        },
        resetPasswordToken: { type: 'varchar', nullable: true },
        confirmAccountToken: { type: 'varchar', length: 40, nullable: true },
        googleId: { type: 'varchar', nullable: true },
        twoFactorEnabled: { type: 'boolean', default: false },
        twoFactorSecret: { type: 'varchar', nullable: true },
        isArchived: { type: 'boolean', default: false },
        isVerified: { type: 'boolean', default: false },
        isCompleted: { type: 'boolean', default: false },
        isFirstTimeLoggedIn: { type: 'boolean', default: true },
        linkedinLink: { type: 'varchar', default: null },
        lastSeen: { type: 'timestamp', nullable: true },
        hasNewNotifications: {
            type: 'boolean',
            default: false,
        },

        createdAt: { type: 'timestamp', createDate: true },
        updatedAt: { type: 'timestamp', updateDate: true },
        
    },
    relations: {
        files: {
            type: 'one-to-many',
            target: 'Files',
            inverseSide: 'candidate',
            cascade: false,
            eager: false,
        },
    },
});
