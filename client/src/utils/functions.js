import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

export function formatDateRange(startDate, endDate) {
  const start = dayjs(startDate);
  if (!endDate) {
    return start.format('MMM YYYY');
  }

  const end = dayjs(endDate);

  if (start.isSame(end, 'month')) {
    return start.format('MMM YYYY');
  }

  return `${start.format('MMM YYYY')} - ${end.format('MMM YYYY')}`;
}

export function formatTime(date) {
  return dayjs(date).format('HH:mm'); 
}
export function formatMessageTooltipDate(date) {
  return dayjs(date).format('ddd, MMM D, YYYY [at] HH:mm');
}
export function formatLastSeen(date) {
  if (!date) return 'Offline';

  const diffInHours = dayjs().diff(dayjs(date), 'hour');

  if (diffInHours > 24) {
    return 'Offline';
  }

  return `Last seen ${dayjs(date).fromNow()}`;
}

export function formatDateHeader(date) {
  const d = dayjs(date);
  const today = dayjs();

  if (d.isSame(today, 'day')) {
    return 'Today';
  }

  if (today.diff(d, 'month') >= 1) {
    return d.format('MMM D, YYYY');
  }

  return d.format('ddd HH:mm');
}
// same d gap > 1 h
export function shouldShowTimeSeparator(prevDate, currDate) {
  if (!prevDate) return false;
  const p = dayjs(prevDate), c = dayjs(currDate);
  return p.isSame(c, 'day') && c.diff(p, 'hour', true) >= 1;
}

export function formatInlineTime(date, isFirstOfDay = false) {
  const d = dayjs(date);
  const today = dayjs();

  if (d.isSame(today, 'day')) return d.format('HH:mm');
  return isFirstOfDay ? d.format('MMM D, YYYY') : d.format('ddd HH:mm');
}
export function groupConversationsByDate(conversations, lastMessageMap) {
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  const groups = {};

  conversations.forEach(conversation => {
    const lastMsg = lastMessageMap.get(conversation.id);
    const lastMsgDate = lastMsg?.createdAt || conversation.lastMessageDate;

    let groupKey = 'Older';
    
    if (lastMsgDate) {
      const msgDate = dayjs(lastMsgDate);
      
      if (msgDate.isSame(today, 'day')) {
        groupKey = 'Today';
      } else if (msgDate.isSame(yesterday, 'day')) {
        groupKey = 'Yesterday';
      } else {
        groupKey = msgDate.format('MMM D, YYYY');
      }
    }

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(conversation);
  });

  return groups;
}
export function formatFullDateUS(date) {
  return dayjs(date).format('MMMM D, YYYY'); 
}
export function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 10) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

export function getAvatarClass(name = '', paletteLength = 14) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `avatar${Math.abs(hash) % paletteLength}`;
}
export function groupNotificationsByDate(notifications) {
  return notifications.reduce((groups, notif) => {
    const d = dayjs(notif.createdAt);
    let label;
    if (d.isToday()) label = 'Today';
    else if (d.isYesterday()) label = 'Yesterday';
    else label = d.format('MMMM D, YYYY');
    groups[label] = groups[label] || [];
    groups[label].push(notif);
    return groups;
  }, {});
}
export const loadCities = async () => {
  const res = await fetch('/data/cities.json');
  if (!res.ok) throw new Error('Failed to load cities.json');
  return res.json();
};

