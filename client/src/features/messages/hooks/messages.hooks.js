import { useAlert } from '@/context/AlertContext';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';


// export function useSendMessage(socket) {
//   const queryClient = useQueryClient();

//   return useMutation(
//     (data) =>
//       new Promise((resolve, reject) => {
//         socket.emit('send_message', data, (ack) => {
//           if (ack.status === 'ok') resolve(ack.message);
//           else reject(new Error(ack.error));
//         });
//       }),
//     {
//       onSuccess: (message) => {
//         if (message.group && message.group.id) {
//           queryClient.invalidateQueries(['messages', message.group.id, 'group']);
//         } else {
//           queryClient.invalidateQueries(['messages', message.receiver.id, 'user']);
          
//         }
//       },
//       onError: (error) => {
//         console.error('Error sending message:', error);
//       },
//     }
//   );
// }
export function useSendMessage(socket) {
  const queryClient = useQueryClient();

  return useMutation(
    (data) =>
      new Promise((resolve, reject) => {
        socket.emit('send_message', data, (ack) => {
          console.log('[send_message] ack received:', ack); // <<<< LOG ACK here
          if (ack.status === 'ok') resolve(ack.message);
          else reject(new Error(ack.error));
        });
      }),
    {
      onSuccess: (message) => {
        console.log('[send_message] success, invalidating queries for:', message);
        if (message.group && message.group.id) {
          queryClient.invalidateQueries(['messages', message.group.id, 'group']);
        } else {
          queryClient.invalidateQueries(['messages', message.receiver.id, 'user']);
        }
      },
      onError: (error) => {
        console.error('Error sending message:', error);
      },
    }
  );
}

export function useConversationMessages(socket, currentUserId, conversationId, type = 'user') {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId, type],
    enabled: !!socket && !!conversationId,
    queryFn: ({ pageParam = 1 }) =>
      new Promise((resolve, reject) => {
        if (!socket) return reject(new Error('Socket not connected'));

        const payload = {
          pageNumber: pageParam,
          pageSize: 20,
          ...(type === 'group' ? { groupId: conversationId } : { withUserId: conversationId }),
        };

        socket.emit('load_conversation', payload, (ack) => {
          if (ack.status === 'ok') {
            resolve({
              messages: ack.messages,
              hasMore: ack.hasMore,
              nextPage: ack.nextPage,
            });
          } else {
            reject(new Error(ack.error || 'Failed to load messages'));
          }
        });
      }),
    getNextPageParam: (lastPage) => {
      return lastPage?.hasMore ? lastPage.nextPage : undefined;
    },
    refetchOnWindowFocus: false,
  });
}

export const useLastMessages = (socket, userId) => {
  return useQuery(
    ['lastMessages', userId],
    () =>
      new Promise((resolve, reject) => {
        if (!socket || !userId) {
          return reject('Socket or userId missing');
        }

        socket.emit('get_last_messages', { userId }, (ack) => {
          // console.log('[useLastMessages] raw ack:', ack);

          if (ack && ack.status === 'ok') {
            resolve({
              messages:      ack.messages      || [],
              unreadCounts: ack.unreadCounts || {},
            });
          } else {
            reject(new Error(ack ? ack.error : 'Invalid response'));
          }
        });
      }),
    {
      enabled: !!socket && !!userId,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export function useCreateGroup(socket) {
  const queryClient = useQueryClient();
    const { openAlert } = useAlert();

  return useMutation(
    ({ name, memberIds }) =>
      new Promise((res, rej) =>
        socket.emit('create_group', { name, memberIds }, (ack) =>
          ack.status === 'ok' ? res(ack.group) : rej(new Error(ack.message))
        )
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups');
        queryClient.invalidateQueries('lastMessages');
        queryClient.invalidateQueries('conversations');
      openAlert("Group created successfully!", "success");

      },
      onError: (error) => {
        console.error('Error creating group:', error);
          let message = "Error creating group";

if (error?.response?.data) {
        if (typeof error.response.data === "string") {
            message = error.response.data;
        } else if (typeof error.response.data === "object" && error.response.data.message) {
            message = error.response.data.message;
        } else {
            message = JSON.stringify(error.response.data);
        }
    } else if (error?.message) {
        message = error.message;
    }

    // Affiche l'alerte
    openAlert(message, "error");
      },
    }
  );
  
}
export function useConversations(
  socket,
  { page = 1, pageSize = 20, search = '' } = {}
) {
  return useQuery(
    ['conversations', page, pageSize, search],
    () =>
      new Promise((resolve, reject) => {
        if (!socket) return reject(new Error('Socket not connected'));
        socket.emit(
          'get_conversations',
          { pageNumber: page, pageSize, search },
          (ack) => {
            if (ack.status === 'ok') {
              resolve({
                pageNumber: ack.data.pageNumber,
                pageSize: ack.data.pageSize,
                totalPages: ack.data.totalPages,
                totalResults: ack.data.totalResults,
                conversations: ack.data.items,
              });
            } else {
              reject(new Error(ack.error || 'Failed to load conversations'));
            }
          }
        );
      }),
    {
      enabled: !!socket && socket.connected,
      keepPreviousData: true,
    }
  );
}