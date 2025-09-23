import { User } from '@/apis/user/interfaces/user.interfaces';

export interface Group {
    id: string;
    name?: string;
    members: User[];
    createdAt: Date;
}
