import { Socket } from 'socket.io';
import { NotificationService } from '@/apis/notifications/notification.service';
import { getIo } from '../index';
import { AppDataSource } from '@/utils/databases';


const notificationService = new NotificationService();

interface ExtendedSocket extends Socket {
    userId?: string;
}

export function handleNotificationEvents(socket: ExtendedSocket, userId: string) {

socket.on('get_notifications', async (data, callback) => {
    try {

        const result = await notificationService.getFilteredNotifications(userId, data);

        const user = await AppDataSource.getRepository('User').findOneBy({ id: userId });

        const payload = {
            status: 'ok' as const,
            ...result,
            hasNewNotifications: user?.hasNewNotifications ?? false,
        };

        callback(payload);
    } catch (err: any) {
        console.error('[Socket] get_notifications → error:', err);
        callback({ status: 'error', error: err.message });
    }
});

socket.on('notifications_menu_opened', async (_data, callback) => {
    try {
        await AppDataSource.getRepository('User')
            .createQueryBuilder()
            .update()
            .set({ hasNewNotifications: false })
            .where('id = :id', { id: userId })
            .execute();

        callback?.({ status: 'ok' });
    } catch (err) {
        console.error('[Socket] notifications_menu_opened → error:', err);
        callback?.({ status: 'error', error: (err as Error).message });
    }
});

    socket.on('mark_notification_read', async (data, callback) => {
        try {
            if (!data?.notificationId) {
                if (typeof callback === 'function') {
                    callback({
                        status: 'error',
                        error: 'Notification ID is required',
                    });
                }
                return;
            }

            await notificationService.markAsRead(data.notificationId);

            if (typeof callback === 'function') {
                callback({ status: 'ok' });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);

            if (typeof callback === 'function') {
                callback({
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error occurred',
                });
            }
        }
    });
    socket.on('mark_all_as_read', async (_data, callback) => {
        try {
            await notificationService.markAllAsRead(userId);
            callback({ status: 'ok' });
            //   socket.emit('all_notifications_marked_read');
            getIo().to(`user_${userId}`).emit('all_notifications_marked_read');
            getIo().to(`user_${userId}`).emit('notifications_status', { hasNewNotifications: false });
        } catch (err) {
            console.error('Error marking all as read:', err);
            callback({ status: 'error', error: (err as Error).message });
        }
    });

    socket.on('mark_notification_favorite', async (data, callback) => {
        try {
            if (!data?.notificationId) {
                if (typeof callback === 'function') {
                    callback({
                        status: 'error',
                        error: 'Notification ID is required',
                    });
                }
                return;
            }

            await notificationService.markAsFavorite(data.notificationId, data.favorite);

            if (typeof callback === 'function') {
                callback({ status: 'ok' });
            }
        } catch (error) {
            console.error('Error marking notification as favorite:', error);

            if (typeof callback === 'function') {
                callback({
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error occurred',
                });
            }
        }
    });

    socket.on('get_unread_notifications_count', async (data, callback) => {
        try {
            const count = await notificationService.getUnreadCount(userId);

            if (typeof callback === 'function') {
                callback({
                    status: 'ok',
                    count,
                });
            }
        } catch (error) {
            console.error('Error getting unread notifications count:', error);

            if (typeof callback === 'function') {
                callback({
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error occurred',
                });
            }
        }
    });
}
