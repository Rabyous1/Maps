import { Socket } from 'socket.io';
import { getSocketIds } from '../userStore';
import { getIo } from '../index';
import { NotificationService } from '@/apis/notifications/notification.service';
import { NotificationTypes } from '@/utils/helpers/constants';
import { areNotificationsEnabled } from '../notificationPreferences';

const notificationService = new NotificationService();
const CALL_TIMEOUT_MS = 30_000; // 30 seconds

const pendingCalls: Record<string, NodeJS.Timeout> = {};
const activeCalls: Record<string, boolean> = {};

export function handleCallEvents(socket: Socket) {
    socket.on('call:start', data => {
        const fromUser = socket.data.user;
        const fromUserId = fromUser?._id;

        console.log(`[SERVER] call:start from=${fromUserId} to=${data.to} isVideo=${!!data.isVideo}`);

        const payload = {
            from: fromUserId,
            fullName: fromUser?.fullName || '',
            profilePicture: fromUser?.profilePicture || '',
            signal: data.signal,
            isVideo: data.isVideo,
        };
        getIo().to(`user_${data.to}`).emit('call:incoming', payload);

        activeCalls[data.to] = true;

        if (pendingCalls[data.to]) {
            clearTimeout(pendingCalls[data.to]);
            delete pendingCalls[data.to];
        }

        pendingCalls[data.to] = setTimeout(async () => {
            if (!activeCalls[data.to]) return;

            console.log(`[SERVER] Missed call detected for user ${data.to}`);

            if (await areNotificationsEnabled(data.to)) {
                try {
                    await notificationService.create({
                        senderId: fromUserId,
                        receiverId: data.to,
                        type: NotificationTypes.MISSED_CALL,
                        content: `You missed a call from ${fromUser?.fullName || 'someone'}`,
                    });
                } catch (err) {
                    console.warn('[SERVER] Failed creating missed-call notification', err);
                }

                getIo()
                    .to(`user_${data.to}`)
                    .emit('new_notification', {
                        senderId: fromUserId,
                        receiverId: data.to,
                        type: NotificationTypes.MISSED_CALL,
                        content: `You missed a call from ${fromUser?.fullName || 'someone'}`,
                    });
            }

            const callerSocketIds = getSocketIds(fromUserId!);
            callerSocketIds.forEach(sid => getIo().to(sid).emit('call:ended'));
            getIo().to(`user_${data.to}`).emit('call:ended');

            delete activeCalls[data.to];
            clearTimeout(pendingCalls[data.to]);
            delete pendingCalls[data.to];
        }, CALL_TIMEOUT_MS);
    });

    socket.on('call:signal', data => {
        const fromUserId = socket.data.user?._id;
        console.log(`[SERVER] call:signal from=${fromUserId} -> to=${data.to}`);

        const socketIds = getSocketIds(data.to);
        socketIds.forEach(sid => {
            getIo().to(sid).emit('call:signal', data.signal);
        });
    });

    socket.on('call:end', data => {
        const fromUserId = socket.data.user?._id;
        console.log(`[SERVER] call:end from=${fromUserId} -> to=${data.to}`);

        activeCalls[data.to] = false;

        const socketIds = getSocketIds(data.to);
        socketIds.forEach(sid => getIo().to(sid).emit('call:ended'));
        getIo().to(`user_${data.to}`).emit('call:ended');

        if (pendingCalls[data.to]) {
            clearTimeout(pendingCalls[data.to]);
            delete pendingCalls[data.to];
        }
    });

    socket.on('call:reject', data => {
        const fromUserId = socket.data.user?._id;
        console.log(`[SERVER] call:reject from=${fromUserId} -> to=${data.to}`);

        const socketIds = getSocketIds(data.to);
        socketIds.forEach(sid => getIo().to(sid).emit('call:rejected'));

        activeCalls[data.to] = false;
        if (pendingCalls[data.to]) {
            clearTimeout(pendingCalls[data.to]);
            delete pendingCalls[data.to];
        }
    });

    socket.on('call:accepted', data => {
        const fromUserId = socket.data.user?._id;
        console.log(`[SERVER] call:accepted from=${fromUserId} -> to=${data.to}`);

        activeCalls[data.to] = false;
        if (pendingCalls[data.to]) {
            clearTimeout(pendingCalls[data.to]);
            delete pendingCalls[data.to];
            console.log(`[SERVER] Cleared pending call timeout for ${data.to} due to accept`);
        }

        if (pendingCalls[fromUserId!]) {
            clearTimeout(pendingCalls[fromUserId!]);
            delete pendingCalls[fromUserId!];
        }

        const callerSocketIds = getSocketIds(data.to);
        callerSocketIds.forEach(sid => getIo().to(sid).emit('call:connected', { with: fromUserId }));
    });
}
