import { NotificationTypes } from "@/utils/helpers/constants";

export interface Notification {
    id?: string;
    senderId?: string;
    receiverId: string;
    type: NotificationTypes;
    content: string;
    isRead?: boolean;
    isFavorite?: Boolean;
    createdAt?: Date;
    targetId?: string;
}