import { Socket } from 'socket.io';
import { getIo } from '../index';
import { GroupService } from '@/apis/messages/groups/groups.service';

export function handleGroupEvents(socket: Socket, userId: string) {
    const groupService = new GroupService();

    socket.on('create_group', async ({ name, memberIds }, ack) => {
        try {
            const group = await groupService.createGroup(name, [...new Set([userId, ...memberIds])], userId);

            getIo()
                .in(group.members.map(m => m.id))
                .socketsJoin(`group_${group.id}`);
            getIo().to(`group_${group.id}`).emit('group_created', group);

            for (const m of group.members) {
                getIo()
                    .to(m.id)
                    .emit('new_notification', {
                        type: 'GROUP_CREATED',
                        content: `You’ve been added to group "${group.name}"`,
                        metadata: { groupId: group.id },
                        createdAt: new Date().toISOString(),
                        isRead: false,
                    });
            }

            ack({ status: 'ok', group });
        } catch (err: any) {
            console.error('[create_group]', err);
            ack({ status: 'error', message: err.message });
        }
    });

    socket.on('join_group', ({ groupId }, ack) => {
        socket.join(`group_${groupId}`);
        getIo().to(`group_${groupId}`).emit('group_member_joined', { groupId, userId });
        ack({ status: 'ok' });
    });

    socket.on('leave_group', ({ groupId }, ack) => {
        socket.leave(`group_${groupId}`);
        getIo().to(`group_${groupId}`).emit('group_member_left', { groupId, userId });
        ack({ status: 'ok' });
    });
}
