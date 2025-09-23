'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSocket } from '@/config/socket';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';

const SocketContext = createContext({
  socket: null, isConnected: false, onlineUsers: [], notifications: [], setNotifications: () => { }, hasNewNotifications: false,
  setHasNewNotifications: () => { }
});
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
  const [socket] = useState(() => createSocket({ autoConnect: false }));
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);


  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[socket] connected', socket.id, 'auth ->', socket.auth);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    socket.on('online_users', (users) => setOnlineUsers(users));
    // socket.on('new_notification', (notif) => setNotifications((prev) => [notif, ...prev]));
    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setHasNewNotifications(true);
    });
    socket.on('all_notifications_marked_read', () => {
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    });
    socket.on('connect_error', (err) => console.error('[socket] connect_error', err));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('online_users');
      socket.off('new_notification');
      socket.off('all_notifications_marked_read');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!currentUser?.id) return;

    if (!socket.connected) {
      socket.auth = { userId: currentUser.id };
      socket.connect();
    }

    socket.emit('user_connected', currentUser.id);
    refetchUser();
  }, [currentUser?.id, socket, refetchUser]);

  return (
    <SocketContext.Provider value={{
      socket, isConnected, onlineUsers, notifications, setNotifications, hasNewNotifications,
      setHasNewNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
}
// 'use client';
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { createSocket } from '@/config/socket';
// import { useCurrentUser } from '@/features/user/hooks/users.hooks';

// // Add pageSize prop and expose through context
// const SocketContext = createContext(null);
// export const useSocket = () => useContext(SocketContext);

// export function SocketProvider({ children, pageSize = 10 }) {
//   const { data: currentUser, refetch: refetchUser } = useCurrentUser();
//   const [socket] = useState(() => createSocket({ autoConnect: false }));
//   const [isConnected, setIsConnected] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     socket.on('connect', () => {
//       setIsConnected(true);
//       // socket.emit('get_notifications', { userId: socket.auth?.userId, pageSize }, (data) => {
//       //   const list = Array.isArray(data)
//       //     ? data
//       //     : Array.isArray(data.notifications)
//       //     ? data.notifications
//       //     : [];
//       //   console.log('📩 Notifications from DB:', list);
//       //   setNotifications(list);
//       // });
//     });

//     socket.on('disconnect', () => setIsConnected(false));
//     socket.on('online_users', (users) => setOnlineUsers(users));
//     socket.on('new_notification', (notif) => setNotifications((prev) => [notif, ...prev]));
//     socket.on('connect_error', (err) => console.error('[socket] connect_error', err));

//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('online_users');
//       socket.off('new_notification');
//       socket.off('connect_error');
//       socket.disconnect();
//     };
//   }, [socket, pageSize]);

//   useEffect(() => {
//     if (!currentUser?.id) return;
//     if (!socket.connected) {
//       socket.auth = { userId: currentUser.id };
//       socket.connect();
//     }
//     socket.emit('user_connected', currentUser.id);
//     refetchUser();
//   }, [currentUser?.id, socket, refetchUser]);

//   return (
//     <SocketContext.Provider value={{ socket, isConnected, onlineUsers, notifications, setNotifications, pageSize }}>
//       {children}
//     </SocketContext.Provider>
//   );
// }
