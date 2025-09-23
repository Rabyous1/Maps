'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import ProfilePicture from './ProfilePicture';
import Tooltip from '@mui/material/Tooltip';
import TickIcon from '@/assets/icons/chat/tick-icon.svg';
import ArrowDownIcon from '@/assets/icons/chat/arrow-down-icon.svg';
import CircularProgress from '@mui/material/CircularProgress';
import { MoreVert as MoreIcon } from '@mui/icons-material';


import {
  formatDateHeader,
  shouldShowTimeSeparator,
  formatInlineTime,
  formatMessageTooltipDate,
} from '@/utils/functions';
import MessageContextMenu from './MessageContextMenu';

export default function MessageThread({
  messages,
  currentUserId,
  styles,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) {
  const ref = useRef(null);
  const lastMessageIdRef = useRef(null);
  const isScrolledToBottomRef = useRef(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const scrollHeightRef = useRef(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuMode, setMenuMode] = useState('menu');
  const [activeMsg, setActiveMsg] = useState(null);

  const openMenu = (e, msg) => {
    e.stopPropagation();
    setActiveMsg(msg);
    setMenuMode('menu');
    setAnchorEl(e.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveMsg(null);
  };

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'auto',
      });
      setNewMessagesCount(0);
    }
  }, []);

  
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad, scrollToBottom]);

  const handleScroll = () => {
    const container = ref.current;
    if (!container) return;

    const isAtTop = container.scrollTop === 0;
    const isAtBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 5;

    isScrolledToBottomRef.current = isAtBottom;

    if (isAtBottom) setNewMessagesCount(0);

    if (isAtTop && hasNextPage && !isFetchingNextPage) {
      // save current scroll position
      scrollHeightRef.current = container.scrollHeight;
      fetchNextPage();
    }
  };

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!isFetchingNextPage && scrollHeightRef.current > 0) {
      const container = ref.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - scrollHeightRef.current;
        scrollHeightRef.current = 0;
      }
    }
  }, [messages, isFetchingNextPage]);


  useEffect(() => {
    const len = messages.length;
    if (!len) {
      lastMessageIdRef.current = null;
      return;
    }
    const lastMsg = messages[len - 1];
    const prevLastId = lastMessageIdRef.current;
    // first load
    if (prevLastId === null) {
      lastMessageIdRef.current = lastMsg.id;
      return;
    }
    // no change at bottom
    if (lastMsg.id === prevLastId) return;
  
    // find new msgs
    const prevIndex = messages.findIndex(m => m.id === prevLastId);
    const newMsgs = prevIndex >= 0 ? messages.slice(prevIndex + 1) : messages;
    // count only otheruser msgs
    const otherCount = newMsgs.filter(m => m.sender.id !== currentUserId).length;
  
    // if sent or already at bottom
    if (otherCount === 0 || isScrolledToBottomRef.current) {
      scrollToBottom();
    } else {
      //show badge
      setNewMessagesCount(n => n + otherCount);
    }
  
    lastMessageIdRef.current = lastMsg.id;
  }, [messages, currentUserId, scrollToBottom]);
  

  if (!messages.length) {
    return <p className={styles.messageNotice}>No messages yet.</p>;
  }

  const lastRead = messages.filter((m) => m.sender.id === currentUserId && m.isRead).pop()?.id;
  const lastSent = messages.filter((m) => m.sender.id === currentUserId).pop()?.id;
  return (
    <div ref={ref} className={styles.messageGroupContainer}>
      {isFetchingNextPage && (
        <div className={styles.spinnerTop}>
          <CircularProgress size={24} />
        </div>
      )}
  
      {newMessagesCount > 0 && (
        <button
          className={styles.newMessagesIndicator}
          onClick={scrollToBottom}
          aria-label={`${newMessagesCount} new messages`}
        >
          <ArrowDownIcon className={styles.arrowDownIcon} />
          <span className={styles.newMessagesCount}>{newMessagesCount}</span>
        </button>
      )}
  
      {messages.map((msg, i) => {
        // console.log(`Message ${msg.id} seenBy:`, msg.seenBy);
        const isFirstOfDay =
          i === 0 ||
          dayjs(messages[i - 1]?.createdAt).format('YYYY-MM-DD') !==
            dayjs(msg.createdAt).format('YYYY-MM-DD');
        const prevMsg = messages[i - 1];
        const isFirstMessageBySender =
          !prevMsg || prevMsg.sender.id !== msg.sender.id;
        const isSelf = msg.sender.id === currentUserId;
  
        const currentDate = dayjs(msg.createdAt).format('YYYY-MM-DD');
        const showDateSeparator =
          i === 0 ||
          dayjs(prevMsg?.createdAt).format('YYYY-MM-DD') !== currentDate;
  
        const showTimeSeparator =
          i > 0 && shouldShowTimeSeparator(prevMsg?.createdAt, msg.createdAt);
  
        const showTick =
          isSelf && (msg.id === lastRead || msg.id === lastSent);
        const hideAvatar =
          !isSelf &&
          !isFirstMessageBySender &&
          !showDateSeparator &&
          !showTimeSeparator;
        
        return (
          <React.Fragment key={msg.id}>
            {showDateSeparator && (
              <div className={styles.dateSeparator}>
                {formatDateHeader(msg.createdAt)}
              </div>
            )}
            {showTimeSeparator && (
              <div className={styles.timeSeparator}>
                <div className={styles.messageTime}>
                  {formatInlineTime(msg.createdAt, isFirstOfDay)}
                </div>
              </div>
            )}

              <div
                className={[
                  styles.messageGroup,
                  isSelf && styles.messageGroupCurrentUser,
                  hideAvatar && styles.messageGroupNoAvatar,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >

              {!isSelf && (isFirstMessageBySender || showDateSeparator || showTimeSeparator) && (
                <ProfilePicture
                  filename={msg.sender.profilePicture?.split('/').pop()}
                  fullName={msg.sender.fullName}
                  styles={styles}
                  size='sm'
                />
              )}

  
              <div className={styles.messageGroupContent}>
              <div className={styles.bubbleWithMenu}>
              {msg.group && isSelf && (
                <MoreIcon
                  className={styles.moreIconOutside}
                  onClick={e => openMenu(e, msg)}
                />
              )}
                <Tooltip
                  title={formatMessageTooltipDate(msg.createdAt)}
                  arrow
                  placement="bottom"
                >
                  <div
                    className={[
                      styles.messageBubble,
                      isSelf && styles.messageBubbleCurrentUser,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {msg.content}
                  </div>
                </Tooltip>
                
              </div>
                {showTick && (
                  <div className={styles.tickWrapper}>
                    <TickIcon
                      className={`${styles.tickIcon} ${
                        msg.isRead
                          ? styles.tickIconRead
                          : styles.tickIcon
                      }`}
                    />
                  </div>
                )}

              </div>
            </div>
          </React.Fragment>
        );
      })}
  
      <MessageContextMenu
        anchorEl={anchorEl}
        onClose={closeMenu}
        message={activeMsg}
        mode={menuMode}
        setMode={setMenuMode}
        styles={styles}
      />
    </div>
  );
}  