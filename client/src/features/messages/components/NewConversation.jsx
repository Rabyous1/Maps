'use client';

import React, { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import GenericSearch from '@/components/GenericSearch';
import { useMessagedUsers, useFrequentUsers } from '@/features/user/hooks/users.hooks';
import ProfilePicture from './ProfilePicture';
import {
  RadioButtonUnchecked as OutlinedIcon,
  CheckCircleOutline as CheckedIcon
} from '@mui/icons-material';
import { Badge, Checkbox, IconButton, Tooltip } from '@mui/material';
import { useCreateGroup } from '../hooks/messages.hooks';
import GenericFormikForm from '@/components/form/GenericFormikForm';
import NoSearchResults from '@/assets/icons/chat/noresultsearch.svg';
import { group } from './messages.fields';
import ReturnIcon from '@/assets/icons/actions/return-icon.svg';


export default function NewConversation({
  styles,
  onUserSelect = () => { },
  onGroupCreated = () => { },
  onBack, 
}) {
  const { socket } = useSocket();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);


  const { mutate: createGroup, isLoading: isCreating } = useCreateGroup(socket);

  const isSearching = search.trim().length > 0;
  const { data: messagedData, isLoading: isSearchLoading } =
    useMessagedUsers({ page: 1, pageSize: 20, search });
  const searchedUsers = messagedData?.users || [];

  const { data: frequentUsers = [], isLoading: isFreqLoading, isError: isFreqError } =
    useFrequentUsers();

  const toggleSelect = (user) => {
    if (selectedIds.includes(user.id)) {
      setSelectedIds((prev) => prev.filter((id) => id !== user.id));
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      setSelectedIds((prev) => [...prev, user.id]);
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleUserClick = (user) => {
    if (selectedIds.length > 0) {
      toggleSelect(user);
    } else {
      onUserSelect(user);
    }
  };

  const renderList = (users) => (
    <div className={styles.resultsList}>
      {users.map((user) => (
        <div key={user.id} className={styles.userItem}>
          <div
            className={styles.userInfo}
            onClick={() => handleUserClick(user)}
          >
            <ProfilePicture
              filename={user.profilePicture?.split('/').pop()}
              fullName={user.fullName}
              styles={styles}
            />
            <span className={styles.userFullname}>{user.fullName}</span>
          </div>
          <Tooltip title="Add to group chat." arrow>
          <Checkbox
              className={styles.userCheckbox}
              icon={<OutlinedIcon />}
              checkedIcon={<CheckedIcon />}
              checked={selectedIds.includes(user.id)}
              onChange={() => toggleSelect(user)}
            /> 

          </Tooltip>
        </div>
      ))}
    </div>
  );

  const renderSelectedUsers = () => (
    <div className={styles.selectedUsersContainer}>
      {selectedUsers.map((user) => (
        <div key={user.id} className={styles.selectedUser}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            badgeContent={
              <button
                type="button"
                className={styles.removeUserBadge}
                onClick={() => toggleSelect(user)}
                aria-label={`Remove ${user.fullName}`}
              >
                ×
              </button>
            }
          >
            <ProfilePicture
              filename={user.profilePicture?.split('/').pop()}
              fullName={user.fullName}
              styles={styles}
            />
          </Badge>
          <span className={styles.selectedUserName}>{user.fullName}</span>
        </div>
      ))}
    </div>
  );

  

  return (
    <>
      <IconButton
        className={styles.returnMobileButtonNewConversation}
        onClick={onBack}
        aria-label="Go back">
           <ReturnIcon className={styles.returnMobileButtonIcon}/>
      </IconButton>
      {selectedIds.length > 0 && (
        <GenericFormikForm
          initialValues={{ groupName: '' }}
          onSubmit={(values) => {
            setFormSubmitted(true);
            if (selectedIds.length < 2) return;
            createGroup(
              { name: values.groupName, memberIds: selectedIds },
              {
                onSuccess: (group) => {
                  onGroupCreated(group);
                  setSelectedIds([]);
                  setSelectedUsers([]);
                  setFormSubmitted(false);
                }
              }
            );
          }}
          fields={group}
          submitText="Create"
          // isSubmitting={isCreating}
          styles={styles}
          formClassName={styles.groupForm}
        />


      )}

      <GenericSearch
        value={search}
        onChange={setSearch}
        placeholder="Tap a name to start typing or select for group"
        styles={{
          wrapper: styles.newConvSearchContainer,
          input: styles.search
        }}
      />

      {selectedIds.length > 0 && renderSelectedUsers()}
      {formSubmitted && selectedIds.length < 2 && (
        <p className={styles.errorText}>Please choose at least 2 users to create a group.</p>
      )}


      <main className={styles.mainGroupContainer}>
        {isSearching ? (
          isSearchLoading ? (
            <p className={styles.resultText}>Loading…</p>
          ) : searchedUsers.length > 0 ? (
            <>
              <p className={styles.searchingForText}>Searching for:</p>
              {renderList(searchedUsers)}
            </>
          ) : (
            <>
              <div className={styles.noSearchIconContainer}>
                <NoSearchResults />
              </div>
              <p className={styles.resultText}>No users match your search.</p>
            </>
          )
        ) : (
          <>
            <p className={styles.frequentUsersTitle}>Frequently contacted</p>
            {isFreqLoading ? (
              <p className={styles.resultText}>Loading…</p>
            ) : isFreqError ? (
              <p className={styles.resultText}>Failed to load.</p>
            ) : (
              renderList(frequentUsers)
            )}
          </>
        )}
      </main>
    </>
  );
}

