import { Socket } from 'socket.io';
import { MessageService } from '@/apis/messages/services/messages.services';
import { getIo } from '../index';
import { emitNotification } from './emitNotification';
import { NotificationTypes } from '@/utils/helpers/constants';
import UserService from '@/apis/user/services/user.service';
import { GroupService } from '@/apis/messages/groups/groups.service';

export function handleMessageEvents(socket: Socket, userId: string) {
    const messageService = new MessageService();
    const userService = new UserService();
    const groupService = new GroupService();

socket.on('send_message', async (data, ack) => {
    try {
        const savedMessage = await messageService.sendMessage(userId, data);
        ack({ status: 'ok', message: savedMessage });

        if (savedMessage.group) {
            const groupRoom = `group_${savedMessage.group.id}`;
            getIo().to(groupRoom).emit('message_received', savedMessage);
            getIo().to(groupRoom).emit('increment_unread', {
                fromGroupId: savedMessage.group.id,
                fromUserId: savedMessage.sender.id,
            });

            const members = await groupService.getGroupMembers(savedMessage.group.id);
            for (const m of members) {
                if (m.id === savedMessage.sender.id) continue;

                await emitNotification({
                    senderId: savedMessage.sender.id,
                    receiverId: m.id,
                    type: NotificationTypes.MESSAGE,
                    content: `New message in ${savedMessage.group.name} from ${savedMessage.sender.fullName} : ${savedMessage.content.slice(0, 20)}…`,
                });
                console.log(`[SOCKET] → notif sent to user_${m.id}`);
            }
        } else {
            const rid = savedMessage.receiver?.id;
            if (!rid) throw new Error('Missing receiver');

            const personalRoom = `user_${rid}`;
            getIo().to(personalRoom).emit('message_received', savedMessage);
            getIo().to(personalRoom).emit('increment_unread', {
                fromUserId: savedMessage.sender.id,
            });

            await emitNotification({
                senderId: savedMessage.sender.id,
                receiverId: rid,
                type: NotificationTypes.MESSAGE,
                content: `New message from ${savedMessage.sender.fullName}: ${savedMessage.content.slice(0, 20)}…`,
            });
            console.log(`[SOCKET] → notif sent to ${personalRoom}`);
        }
    } catch (e: any) {
        console.error('[SOCKET] send_message error', e);
        ack({ status: 'error', error: e.message });
    }
});

    socket.on('get_last_messages', async (_, ack) => {
        try {
            const messages = await messageService.getLastMessagesGroupedByUser(userId);
            const unreadCounts = await messageService.getUnreadCounts(userId);
            ack({ status: 'ok', messages, unreadCounts });
        } catch (err: any) {
            ack({ status: 'error', error: err.message });
        }
    });

    socket.on('mark_conversation_read', async ({ withUserId, groupId }) => {
        try {
            if (groupId) {
                await messageService.markGroupMessagesAsSeen(userId, groupId);
                socket.emit('reset_unread', { fromGroupId: groupId });
                getIo().to(`group_${groupId}`).emit('group_message_seen', { groupId, userId });
            } else {
                await messageService.markMessagesAsRead(userId, withUserId!);
                getIo().to(withUserId!).emit('message_read', { fromUserId: userId });
                socket.emit('reset_unread', { fromUserId: withUserId });
            }
        } catch (err) {
            console.error('mark_conversation_read error:', err);
        }
    });

    socket.on('get_conversations', async (params, ack) => {
        try {
            const role = (socket.data.user as any).roles;
            const result = await userService.getUsersWithMessagesByOppositeRole(userId, role, {
                pageNumber: String(params.pageNumber || 1),
                pageSize: String(params.pageSize || 20),
                search: params.search || '',
            });
            ack({ status: 'ok', data: result });
        } catch (err: any) {
            ack({ status: 'error', error: err.message });
        }
    });

    socket.on('load_conversation', async (params, ack) => {
        try {
            const { messages, totalMessages } = await messageService.loadConversation(userId, params);
            const pageNumber = params.pageNumber || 1;
            const pageSize = params.pageSize || 20;
            const hasMore = pageNumber * pageSize < totalMessages;
            ack({ status: 'ok', messages, hasMore, nextPage: hasMore ? pageNumber + 1 : null });
        } catch (err: any) {
            ack({ status: 'error', error: err.message });
        }
    });
}
