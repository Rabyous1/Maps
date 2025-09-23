import { useQuery, useMutation, useQueryClient } from 'react-query';

export function useNotifications(socket, userId, pageNumber, pageSize, filters) {
  return useQuery(
    ['notifications', userId, pageNumber, pageSize, filters],
    () =>
      new Promise((resolve, reject) => {
        socket.emit(
          'get_notifications',
          { userId, pageNumber, pageSize, ...filters },
          (ack) => {
            if (ack.status === 'ok') {
              resolve({
                items: ack.notifications,
                meta: {
                  pageNumber: ack.pageNumber,
                  pageSize: ack.pageSize,
                  totalPages: ack.totalPages,
                  totalNotifications: ack.totalNotifications,
                },
              });
            } else {
              reject(new Error(ack.error));
            }
          }
        );
      }),
    {
      enabled: !!socket && !!userId,
      keepPreviousData: true,
    }
  );
}

export function useMarkNotificationRead(socket) {
  const queryClient = useQueryClient();
  return useMutation(
    (notificationId) =>
      new Promise((resolve, reject) => {
        socket.emit('mark_notification_read', { notificationId }, (ack) => {
          if (ack?.status === 'ok') resolve(ack);
          else reject(new Error(ack?.error || 'Mark read failed'));
        });
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(['notifications']),
    }
  );
}
export function useMarkNotificationFavorite(socket) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ notificationId, favorite }) =>
      new Promise((resolve, reject) => {
        socket.emit('mark_notification_favorite', { notificationId, favorite }, (ack) => {
          if (ack?.status === 'ok') resolve(ack);
          else reject(new Error(ack?.error || 'Mark favorite failed'));
        });
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(['notifications']),
    }
  );
}
