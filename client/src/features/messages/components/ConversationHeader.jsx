'use client';
import React from 'react';
import InfoIcon from '@/assets/icons/chat/info-icon.svg';
import ProfilePicture from './ProfilePicture';
import { formatLastSeen } from '@/utils/functions';
import { GroupAvatars } from './GroupAvatars';
import Tooltip from '@mui/material/Tooltip';
import ReturnIcon from '@/assets/icons/actions/return-icon.svg';

export default function ConversationHeader({
  selectedConversation,
  isOnline,
  styles,
  currentUserId,
  onBack, 
}) {
  if (!selectedConversation) return null;

  const { type, profilePicture, fullName, name, members = [], lastSeen } = selectedConversation;
  const isGroup = type === 'group';

  const renderAvatar = () =>
    isGroup ? (
      <GroupAvatars
        members={members}
        styles={styles}
        onlineUsers={isOnline ? [selectedConversation.id] : []}
        currentUserId={currentUserId}
      />
    ) : (
      <ProfilePicture
        filename={profilePicture?.split('/').pop() || ''}
        fullName={fullName}
        styles={styles}
        isOnline={isOnline}
      />
    );

  const renderTextInfo = () => {
    if (!isGroup) {
      return (
        <>
          <span className={styles.chatUsername}>{fullName}</span>
          <span className={styles.chatStatus}>
            {isOnline ? 'Online' : formatLastSeen(lastSeen)}
          </span>
        </>
      );
    }

    const firstTwo = members.slice(0, 2);
    const extras = members.slice(2);
    const displayNames = firstTwo.map(u => u.fullName).join(', ');
    const extraCount = extras.length;
    const title = name?.trim() || `${displayNames}${extraCount > 0 ? ` +${extraCount}` : ''}`;
    const tooltipContent = extras.map(u => u.fullName).join(', ');

    return (
      <>
        {extraCount > 0 ? (
          <Tooltip title={tooltipContent} arrow placement="right-start">
            <span className={styles.chatUsername}>{title}</span>
          </Tooltip>
        ) : (
          <span className={styles.chatUsername}>{title}</span>
        )}
        {name?.trim() && (
          <span className={styles.chatMembersNames}>
            {displayNames}{extraCount > 0 ? ` +${extraCount}` : ''}
          </span>
        )}
      </>
    );
  };

  return (
    <header className={styles.conversationHeader}>
      <button
        type="button"
        className={styles.returnMobileButton}
        onClick={onBack}
        aria-label="Go back"
      >
        <ReturnIcon className={styles.returnMobileButtonIcon}/>
      </button>
      <div className={styles.chatHeaderLeft}>
        <div className={styles.avatarWrapper}>{renderAvatar()}</div>
        <div className={styles.chatUserInfo}>{renderTextInfo()}</div>
      </div>
      <InfoIcon className={styles.infoIcon} />
    </header>
  );
}
