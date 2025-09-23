import { Socket } from 'socket.io';
import { handleMessageEvents } from './messageEvents';
import { handleNotificationEvents } from './notificationEvents';
import { handleGroupEvents } from './groupEvents';
import { handleCallEvents } from './callEvents';
import { addUser, removeUser, getOnlineUsers } from '../userStore';
import { getIo } from '../index';
import Payload from '@/utils/interfaces/payload.interface';
import UserService from '@/apis/user/services/user.service';
import { GroupService } from '@/apis/messages/groups/groups.service';
import { setNotificationsEnabled } from '../notificationPreferences';

const userService = new UserService();
const groupService = new GroupService();

export function handleConnection(socket: Socket) {
  const user = socket.data.user as Payload;
  const userId = user._id;

  addUser(userId, socket.id);
  getIo().emit('online_users', getOnlineUsers());
  
  socket.join(`user_${userId}`);
  console.log(`User ${userId} joined notification room: user_${userId}`);

  (async () => {
    try {
      const groups = await groupService.getUserGroups(userId);
      for (const g of groups) socket.join(`group_${g.id}`);
    } catch (err) {
      console.error('Failed to join group rooms:', err);
    }
  })();

  socket.on('toggle_notifications', ({ enabled }) => {
      console.log(`[SOCKET] → User ${userId} set notifications to: ${enabled}`);
      setNotificationsEnabled(userId, enabled);
  });
  handleMessageEvents(socket, userId);
  handleGroupEvents(socket, userId);
  handleCallEvents(socket);
  handleNotificationEvents(socket, userId);

  socket.on('disconnect', async () => {
    // console.log(`[SOCKET] ❌ User ${userId} disconnected.`);
    // removeUser(userId);
    // getIo().emit('online_users', getOnlineUsers());
     console.log(`[SOCKET] ❌ User ${userId} disconnected socket ${socket.id}.`);
     removeUser(userId, socket.id);
     getIo().emit('online_users', getOnlineUsers());
    try {
      const now = new Date().toISOString();
      await userService.updateLastSeen(userId, now);
      const lastSeen = await userService.getLastSeenFromDb(userId);
      getIo().emit('user_status_update', { id: userId, online: false, lastSeen });
    } catch (err) {
      console.error('Failed to update last seen:', err);
    }
  });
}
