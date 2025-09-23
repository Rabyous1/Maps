"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import NewConversation from './NewConversation';
import GenericButton from '@/components/ui/inputs/Button';
import GenericSearch from '@/components/GenericSearch';
import AddConversationIcon from '@/assets/icons/chat/newConversation-icon.svg';
import EmptyChat from '@/assets/images/png/chat/emptychat.png';
import { useSocket } from '@/context/SocketContext';
import { useCurrentUser } from '@/features/user/hooks/users.hooks';
import {
  useConversationMessages,
  useLastMessages,
  useSendMessage,
  useConversations,
} from '../hooks/messages.hooks';

// Utility to extract ID from string or object
const getId = (value) => String(value?.id ?? value);

export default function Chat({ styles }) {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;
  const { socket, onlineUsers } = useSocket();

  const [selectedId, setSelectedId] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: lastMessages, refetch: refreshLast } = useLastMessages(socket, currentUserId);

  const { data: convData, refetch: refreshConvs } = useConversations(socket, { page: 1, pageSize: 20, search });

  const conversations = useMemo(
    () => convData?.conversations?.filter(c => c.type !== 'user' || c.id !== currentUserId) || [],
    [convData, currentUserId]
  );

  const selectedConv = useMemo(() => {
    const found = conversations.find(c => c.id === selectedId);
    if (found) return found;
    if (selectedProfile?.id === selectedId)
      return { ...selectedProfile, type: selectedProfile.type || 'user' };
    return null;
  }, [conversations, selectedId, selectedProfile]);

  const convId = selectedConv?.id || '';
  const convType = selectedConv?.type || 'user';

  const {
    data: msgsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refreshMsgs,
    isLoading: loadingMsgs,
  } = useConversationMessages(socket, currentUserId, convId, convType);

  // Emit "seen" when group messages finish loading
  useEffect(() => {
    if (!loadingMsgs && convType === 'group' && convId) {
      socket.emit('mark_conversation_read', { groupId: convId });
    }
  }, [loadingMsgs, convType, convId, socket]);

  const messages = useMemo(
    () => msgsData?.pages?.flatMap(p => p.messages).reverse() || [],
    [msgsData]
  );

  const sendMessage = useSendMessage(socket);

  // Sync unread counts
  useEffect(() => {
    if (lastMessages?.unreadCounts)
      setUnreadCounts(lastMessages.unreadCounts);
  }, [lastMessages]);

  // Refetch conversations on search change
  useEffect(() => {
    refreshConvs();
  }, [search, refreshConvs]);

  // Handle incoming socket events
  // useEffect(() => {
  //   if (!socket || !currentUserId) return;

  //   const handlers = {
  //     message_received: (msg) => {
  //       console.log('[socket] message_received event received:', msg);
  //       const key = msg.group?.id || (msg.sender.id === currentUserId ? msg.receiver.id : msg.sender.id);
  //       const isActive = key === selectedId;
  //       if (isActive) {
  //         socket?.emit('mark_conversation_read', {
  //           ...(selectedConv?.type === 'group'
  //             ? { groupId: selectedConv?.id }
  //             : { withUserId: selectedConv?.id }),
  //         });
  //         refreshMsgs();
  //       }
  //       refreshLast();
  //       refreshConvs();
  //     },
  useEffect(() => {
  if (!socket || !currentUserId) return;

  const handlers = {
    message_received: (msg) => {
      console.log('[socket] message_received event received:', msg); // <<<< LOG MESSAGE RECEIVED

      const key = msg.group?.id || (msg.sender.id === currentUserId ? msg.receiver.id : msg.sender.id);
      const isActive = key === selectedId;

      if (isActive) {
        console.log('Marking conversation as read for', selectedConv?.id);
        socket?.emit('mark_conversation_read', {
          ...(selectedConv?.type === 'group'
            ? { groupId: selectedConv?.id }
            : { withUserId: selectedConv?.id }),
        });
        refreshMsgs();
      }

      refreshLast();
      refreshConvs();
    },
      increment_unread: ({ fromUserId, fromGroupId }) => {
        const key = fromGroupId || fromUserId;
        if (key !== selectedId) {
          setUnreadCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        }
        refreshConvs();
      },
      reset_unread: ({ fromUserId, fromGroupId }) => {
        const key = fromGroupId ?? fromUserId;
        setUnreadCounts(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        refreshLast();
      },
      message_read: ({ fromUserId, fromGroupId }) => {
        if ((fromGroupId || fromUserId) === selectedId) refreshMsgs();
        refreshLast();
      },
      group_message_seen: ({ groupId }) => {
        if (groupId === selectedId) {
          refreshMsgs();
        }
      },
    };

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
    return () => Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn));
  }, [
    socket,
    currentUserId,
    selectedId,
    selectedConv?.id,
    selectedConv?.type,
    refreshMsgs,
    refreshLast,
    refreshConvs,
  ]);

  const handleSelect = useCallback((entity) => {
    const id = getId(entity);
    setSelectedId(id);
    setIsCreating(false);
    const type = entity?.type || 'user';

    socket?.emit('mark_conversation_read', {
      ...(type === 'group' ? { groupId: id } : { withUserId: id }),
    });

    if (typeof entity !== 'string') setSelectedProfile(entity);
  }, [socket]);

  const handleSend = useCallback((values, helpers) => {
    const payload = { content: values.content };
    if (convType === 'group') payload.groupId = convId;
    else payload.receiverId = convId;
    sendMessage.mutate(payload, {
      onSuccess: () => {
        helpers.resetForm();
        refreshMsgs();
        refreshLast();
        refreshConvs();
      },
    });
  }, [convId, convType, refreshMsgs, refreshLast, refreshConvs, sendMessage]);

  if (!socket || !currentUserId) return <div className={styles.loading}>Connecting…</div>;

  return (
    <div className={styles.wrapper} data-has-selection={!!selectedId} data-is-creating={isCreating}>
      <aside className={styles.left}>
        <header className={styles.conversationsHeader}>
          <h4 className={styles.conversationsTitle}>Conversations</h4>
          <GenericButton
            startIcon={<AddConversationIcon className={styles.addConversationIcon} />}
            size="small"
            variant="outlined"
            onClick={() => { setSelectedId(''); setIsCreating(true); }}
            className={styles.conversationsButton}
          >
            <span className={styles.buttonText}>New Conversation</span>
          </GenericButton>
        </header>

        <GenericSearch value={search} onChange={setSearch} placeholder="Search" styles={{ searchWrapper: styles.subHeader, input: styles.search }} />

        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          setSelectedId={handleSelect}
          lastMessageMap={new Map(lastMessages?.messages.map(m => {
            const key = m.group?.id || (m.sender.id === currentUserId ? m.receiver.id : m.sender.id);
            return [key, m];
          }))}
          currentUserId={currentUserId}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
          styles={styles}
        />
      </aside>

      <main className={styles.right}>
        {selectedConv && (
          <ConversationHeader
            selectedConversation={selectedConv}
            isOnline={selectedConv.type === 'user' && onlineUsers.includes(selectedConv.id)}
            styles={styles}
            currentUserId={currentUserId}
            onBack={() => setSelectedId('')}
          />
        )}

        <div className={styles.messagesContainer}>
          {isCreating ? (

            <NewConversation styles={styles} onUserSelect={handleSelect} onGroupCreated={(grp) => handleSelect(grp)} onBack={() => setIsCreating(false)} />
          ) : !selectedId ? (
            <div className={styles.emptyContainer}>
              <img src={EmptyChat.src} alt="Empty Chat" className={styles.messageNoticeImage} />
              <p className={styles.messageNotice}>No conversation selected.</p>
            </div>
          ) : loadingMsgs ? (
            <p className={styles.messageNotice}>Loading messages…</p>
          ) : (
            <MessageThread
              messages={messages}
              currentUserId={currentUserId}
              styles={styles}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}
        </div>

        {selectedId && !isCreating && (
          <MessageInput styles={styles} onSubmit={handleSend} selectedUserId={selectedId} />
        )}
      </main>
    </div>
  );
}
