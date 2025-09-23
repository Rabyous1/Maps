import { NotificationRepository } from './notification.repository';
import { Notification } from './notification.interfaces';
import { AppDataSource } from '@/utils/databases';

export class NotificationService {
    private notificationRepository = new NotificationRepository();

    public createQueryBuilder() {
        return this.notificationRepository.createQueryBuilder();
    }
    async create(n: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
        const notif = await this.notificationRepository.create(n);

        await AppDataSource.getRepository('User')
            .createQueryBuilder()
            .update()
            .set({ hasNewNotifications: true })
            .where('id = :id', { id: n.receiverId })
            .execute();

        return notif;
    }

    async getUserNotifications(userId: string): Promise<Notification[]> {
        return this.notificationRepository.findByUserId(userId);
    }
    async getUserNotificationsPaginated(
        userId: string,
        pageNumber?: number,
        pageSize?: number,
    ): Promise<{
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalNotifications: number;
        notifications: Notification[];
    }> {
        return this.notificationRepository.findByUserIdPaginated(userId, pageNumber, pageSize);
    }
    async getFilteredNotifications(
        userId: string,
        options: {
            pageNumber?: number;
            pageSize?: number;
            isRead?: string;
            isFavorite?: string;
            type?: string;
            startDate?: string;
            endDate?: string;
        },
    ): Promise<{
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalNotifications: number;
        notifications: Notification[];
    }> {
        const { pageNumber = 1, pageSize = 10, isRead, isFavorite, type, startDate, endDate } = options;

        let qb = this.notificationRepository
            .createQueryBuilder()
            .where('notification.receiverId = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC')
            .skip((pageNumber - 1) * pageSize)
            .take(pageSize);

        if (isRead === 'true' || isRead === 'false') {
            qb = qb.andWhere('notification.isRead = :isRead', {
                isRead: isRead === 'true',
            });
        }

        if (isFavorite === 'true' || isFavorite === 'false') {
            qb = qb.andWhere('notification.isFavorite = :isFavorite', {
                isFavorite: isFavorite === 'true',
            });
        }

        if (type) {
            qb = qb.andWhere('notification.type = :type', { type });
        }

        if (startDate) {
            qb = qb.andWhere('notification.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            qb = qb.andWhere('notification.createdAt <= :endDate', { endDate });
        }

        const [notifications, totalNotifications] = await qb.getManyAndCount();
        const totalPages = Math.ceil(totalNotifications / pageSize);

        return {
            pageNumber,
            pageSize,
            totalPages,
            totalNotifications,
            notifications,
        };
    }
    async markAsRead(notificationId: string): Promise<void> {
        await this.notificationRepository.markAsRead(notificationId);
    }
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.markAllAsReadForUser(userId);
    }
    async markAsFavorite(notificationId: string, favorite: boolean): Promise<void> {
        await this.notificationRepository.markAsFavorite(notificationId, favorite);
    }

    async delete(notificationId: string): Promise<void> {
        await this.notificationRepository.delete(notificationId);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.repository.count({
            where: { receiverId: userId, isRead: false },
        });
    }
}
