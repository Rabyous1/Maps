import { AppDataSource } from '@/utils/databases';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NotificationEntitySchema } from './notification.model';
import { Notification } from './notification.interfaces';


export class NotificationRepository {
    public repository: Repository<Notification>;

    constructor() {
        this.repository = AppDataSource.getRepository(NotificationEntitySchema);
    }

    createQueryBuilder(): SelectQueryBuilder<Notification> {
        return this.repository.createQueryBuilder('notification');
    }

    async create(notification: Partial<Notification>): Promise<Notification> {
        const entity = this.repository.create(notification);
        return this.repository.save(entity);
    }

    async findByUserId(receiverId: string): Promise<Notification[]> {
        return this.repository.find({
            where: { receiverId },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(notificationId: string): Promise<void> {
        await this.repository.update(notificationId, { isRead: true });
    }
    async markAllAsReadForUser(receiverId: string): Promise<void> {
        await this.repository.update({ receiverId, isRead: false }, { isRead: true });
    }
    async markAsFavorite(notificationId: string, favorite: boolean): Promise<void> {
        await this.repository.update(notificationId, { isFavorite: favorite });
    }

    async delete(notificationId: string): Promise<void> {
        await this.repository.delete(notificationId);
    }
    async findByUserIdPaginated(
        userId: string,
        pageNumber = 1,
        pageSize = 10,
    ): Promise<{
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalNotifications: number;
        notifications: Notification[];
    }> {
        const [notifications, totalNotifications] = await this.repository.findAndCount({
            where: { receiverId: userId },
            order: { createdAt: 'ASC' },
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
        });

        const totalPages = Math.ceil(totalNotifications / pageSize);

        return { pageNumber, pageSize, totalPages, totalNotifications, notifications };
    }
}
