'use client';
import React from 'react';
import dayjs from 'dayjs';
import { groupConversationsByDate } from '@/utils/functions';
import ProfilePicture from './ProfilePicture';
import { GroupAvatars } from './GroupAvatars';

export default function ConversationList({
  conversations,
  selectedId,
  setSelectedId,
  lastMessageMap,
  currentUserId,
  onlineUsers,
  unreadCounts,
  styles,
}) {
  
  if (!conversations.length) {
    return (
      <div className={styles.emptyConversationsList}>
        <p className={styles.emptyText}>You have no conversations yet.</p>
      </div>
    );
  }

  const grouped = groupConversationsByDate(conversations, lastMessageMap);

  return (
    <div className={styles.conversationsList}>
      {Object.entries(grouped).map(([label, items]) => (
        <React.Fragment key={label}>
          <div className={styles.dateLabel}>{label}</div>
          {items.map(item => {
            // console.log(`[Render] item.id=${item.id}, unread=${unreadCounts[item.id]}`);

            const isGroup = item.type === 'group';
            const lastMsg = lastMessageMap.get(item.id);
            const prefix = lastMsg
            ? (lastMsg.sender.id === currentUserId ? 'You: ' : `${lastMsg.sender.fullName}: `)
            : '';


            let displayName;
            if (isGroup) {
              const firstTwo = (item.members || []).slice(0, 2);
              const firstTwoNames = firstTwo.map(m => m.fullName).join(', ');
              const extraCount = (item.members?.length || 0) - firstTwo.length;
              const fallbackName = firstTwoNames + (extraCount > 0 ? ` +${extraCount}` : '');
              displayName = item.name?.trim() || fallbackName;
            } else {
              displayName = item.fullName;
            }

            return (
              <div
                key={item.id}
                className={`${styles.conversationItem} ${selectedId === item.id ? styles.selectedConversationItem : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                  {isGroup ? (
                    <GroupAvatars
                      members={item.members}
                      styles={styles}
                      onlineUsers={onlineUsers}
                      hasBorder
                      small
                      currentUserId={currentUserId}
                    />
                  ) : (
                    <ProfilePicture
                      filename={item.profilePicture?.split('/').pop()}
                      fullName={displayName}
                      styles={styles}
                      isOnline={onlineUsers.includes(item.id)}
                      hasBorder
                    />
                  )}

                <section className={styles.conversationInfo}>
                  <div className={styles.topRow}>
                    <span className={styles.conversationName}>{displayName}</span>
                    {lastMsg && (
                      <span className={styles.timestamp}>
                        {dayjs(lastMsg.createdAt).format('HH:mm')}
                      </span>
                    )}
                  </div>
                  <div className={styles.bottomRow}>
                    <span className={styles.lastMessage}>
                      {lastMsg ? `${prefix}${lastMsg.content}` : 'No messages yet'}
                    </span>
                    
                    {unreadCounts[item.id] > 0 && selectedId !== item.id && (
                      <span className={styles.unreadBadge}>{unreadCounts[item.id]}</span>
                      
                    )}
                  </div>
                </section>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
