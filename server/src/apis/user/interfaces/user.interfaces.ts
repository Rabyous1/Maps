import { FileI } from '@/apis/storage/files.interface';
import { Role, Countries} from '@/utils/helpers/constants';

type Country = keyof typeof Countries;
type Countrys = typeof Countries[number]; // ✅ Union de toutes les valeurs


export interface User {
    id: string;
    fullName: string;
    dateOfBirth: string | null;
    email: string;
    password: string;
    phone: string;
    roles: Role;
    country: Countrys;
    isVerified: boolean;
    isArchived: boolean;
    isCompleted?: boolean;
    resetPasswordToken?: string | null;
    confirmAccountToken?: string | null;
    googleId?: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string | null;
    createdAt: Date;
    updatedAt: Date;
    profilePicture?: string | null;
    isFirstTimeLoggedIn: boolean;
    linkedinLink: string;
    lastSeen?: Date;
    hasNewNotifications: boolean;
    files?: FileI[];
}
export interface Userr {
    id: string;
    fullName: string;
    dateOfBirth: string | null;
    email: string;
    password: string;
    phone: string;
    roles: Role;
    country: Countrys;
    isVerified: boolean;
    isArchived: boolean;
    isCompleted?: boolean;
    resetPasswordToken?: string | null;
    confirmAccountToken?: string | null;
    googleId?: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string | null;
    createdAt: Date;
    updatedAt: Date;
    profilePicture?: string | null;
    isFirstTimeLoggedIn: boolean;
    linkedinLink: string;
    lastSeen?: Date;
    hasNewNotifications: boolean;
    files?: FileI[];
}