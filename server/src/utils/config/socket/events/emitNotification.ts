import { getIo } from '../index';
import { NotificationService } from '@/apis/notifications/notification.service';
import { NotificationTypes } from '@/utils/helpers/constants';  
import { areNotificationsEnabled } from '../notificationPreferences';

const notificationService = new NotificationService();

export interface EmitNotificationParams {
    senderId: string;
    receiverId: string;
    type: NotificationTypes;
    content: string;
    targetId?: string;
}

export async function emitNotification(params: EmitNotificationParams) {

  if (!areNotificationsEnabled(params.receiverId)) {
      return null; 
  }

  const saved = await notificationService.create(params);

  const room = `user_${saved.receiverId}`;
  getIo().to(room).emit('new_notification', saved);
  


  return saved;
}
