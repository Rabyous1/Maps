import { EntitySchema } from 'typeorm';
import { Notification } from './notification.interfaces';

export const NotificationEntitySchema = new EntitySchema<Notification>({
    name: 'Notification',
    tableName: 'notification',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        senderId: { type: 'uuid' },
        receiverId: { type: 'uuid' },
        type: { type: 'varchar' },
        content: { type: 'text' },
        isRead: { type: 'boolean', default: false },
        isFavorite: { type: 'boolean', default: false },
        createdAt: { type: 'timestamp', createDate: true },
        targetId: { type: 'uuid', nullable: true },
    },
});
