import { frontUrls } from '@/utils/front-urls';
import IconDashboard from '@/assets/icons/dashboard/icon-dashboard.svg';
import IconProfile from '@/assets/icons/dashboard/icon-profile.svg';
import IconChat from '@/assets/icons/dashboard/icon-chat.svg';
import IconSettings from '@/assets/icons/dashboard/icon-settings.svg';
import IconFavorites from '@/assets/icons/opportunities/icon-favorites.svg';
import IconOppportunity from '@/assets/icons/dashboard/cards/suitcase.svg';
import IconApplicants from '@/assets/icons/account/icon-file.svg';
import IconApplications from '@/assets/icons/dashboard/icon-applications.svg';
import IconNotifications from '@/assets/icons/header/icon-notification.svg';
import IconMeets from '@/assets/icons/video-chat/meet-icon.svg';
import FileIcon from "@/assets/icons/account/icon-file.svg";
import UsersList from '@/assets/icons/dashboard/icon-list.svg';
import AddUser from '@/assets/icons/dashboard/icon-addUser.svg';


export const adminMenu = [
  {
    text: 'Users List',
    icon: <UsersList />,
    href: frontUrls.users,
  },
    {
    text: 'Add User',
    icon: <AddUser />,
    href: frontUrls.addUser,
  },
];

export const candidatMenu = [
  { text: 'Dashboard', icon: <IconDashboard />, href: frontUrls.dashboard },
  { text: 'My Applications', icon: <IconApplications />, href: frontUrls.myApplications },
  { text: 'My Resumes', icon: <FileIcon />, href: frontUrls.myResumes },
  { text: 'My Favorites', icon: <IconFavorites />, href: frontUrls.myFavorites },
  { text: 'My Profile', icon: <IconProfile />, href: frontUrls.account },
  { text: 'Chat', icon: <IconChat />, href: frontUrls.chat },
  { text: 'Interviews List', icon: <IconMeets />, href: frontUrls.interviewsList },
  { text: 'Notifications', icon: <IconNotifications />, href: frontUrls.notifications },
  { text: 'Settings', icon: <IconSettings />, href: frontUrls.settings },
];

export const recruteurMenu = [
  { text: 'Dashboard', icon: <IconDashboard />, href: frontUrls.dashboard },
  { text: 'My Profile', icon: <IconProfile />, href: frontUrls.account },
  {
    text: 'Opportunities',
    icon: <IconOppportunity />,
    children: [
      { text: 'Opportunities List', href: frontUrls.opportunities },
      { text: 'Add Opportunity', href: frontUrls.addOpportunity },
    ],
  },
  { text: 'Applications', icon: <IconApplicants />, href: frontUrls.applications },
  
  { text: 'Chat', icon: <IconChat />, href: frontUrls.chat },
  {
    text: 'Interviews',
    icon: <IconMeets />,
    children: [
      { text: 'Schedule Interviews', href: frontUrls.schInterviews },
      { text: 'Make Interviews', href: frontUrls.interviews },
    ],
  },
  { text: 'Notifications', icon: <IconNotifications />, href: frontUrls.notifications },
  { text: 'Settings', icon: <IconSettings />, href: frontUrls.settings },
  // { text: 'Help Center', icon: <IconHelp />, href: frontUrls.helpcenter },
];