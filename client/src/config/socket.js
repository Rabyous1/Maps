import { io } from 'socket.io-client';

export function createSocket(opts = {}) {
  return io(process.env.NEXT_PUBLIC_API_URL_SOCKET, {
    path: '/api/v1/socket.io',
    withCredentials: true,
    autoConnect: opts.autoConnect ?? true,
  });
}

