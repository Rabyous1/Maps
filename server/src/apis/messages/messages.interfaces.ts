import { User } from '../user/interfaces/user.interfaces';
import { Group } from './groups/groups.interfaces';
export interface Message {
    id: string;
    sender: User;
    receiver?: User;
    group?: Group;
    content: string;
    attachments: string[];
    isRead: boolean;
    isAnnouncement?: boolean;
    createdAt: Date;
    updatedAt: Date;
    seenBy?: SeenMessage[];
}
export interface SeenMessage {
    id: string;
    message: Message;
    user: User;
    seenAt: Date;
}