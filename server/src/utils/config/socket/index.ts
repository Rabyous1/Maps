import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { setupAuthMiddleware } from '@/middlewares/socket.middleware';
import { handleConnection } from '@/utils/config/socket/events/connectionEvents';

let _io: SocketIOServer;

export function initialiseSocket(server: http.Server) {
    _io = new SocketIOServer(server, {
        path: '/api/v1/socket.io',
        cors: { origin: process.env.CORS_DOMAIN, credentials: true },
    });

    _io.use(setupAuthMiddleware);
    _io.on('connection', socket => {
        console.log(`[SOCKET] New connection: ${socket.id}`);
        handleConnection(socket);

        socket.on('disconnect', () => {
            console.log(`[SOCKET] Disconnected: ${socket.id}, Rooms:`, socket.rooms);
        });
    });
}

export function getIo(): SocketIOServer {
    if (!_io) {
        throw new Error('Socket.IO has not been initialised yet!');
    }
    return _io;
}
