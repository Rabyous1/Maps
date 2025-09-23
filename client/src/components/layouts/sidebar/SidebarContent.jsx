'use client';

import LogoutButton from '@/features/auth/components/login/LogoutButton';
import FindJobButton from '../layoutButtons/FindJobButton';
import ClearIcon from '@mui/icons-material/Clear';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse
} from '@mui/material';
import IconArrowLeft from '@/assets/icons/dashboard/arrow-square-left.svg';
import IconArrowRight from '@/assets/icons/dashboard/arrow-square-right.svg';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState } from 'react';


export default function SidebarContent({
  open,
  mobileOpen,
  desktopToggle,
  mobileToggle,
  menuItems,
  pathname,
  router,
  setMobileOpen,
  isCandidate,
  profileCompleteness,
  styles,
}) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (text) => {
    setOpenMenus((prev) => ({ ...prev, [text]: !prev[text] }));
  };
  return (
    <>
      <div className={`${styles.header} ${styles.headerBase}`}>
        <h3 className={`${styles.titlesidebar} ${!open ? styles.hideOnDesktop : ''}`}>MAPS</h3>
        <IconButton onClick={desktopToggle} className={styles.desktopToggle}>
          {open ? (
            <IconArrowLeft aria-label="Collapse sidebar" className={styles.icon} />
          ) : (
            <IconArrowRight aria-label="Expand sidebar" className={styles.icon} />
          )}

        </IconButton>

        {mobileOpen && (
          <div className={styles.mobileToggle}>
            <IconButton aria-label="close sidebar" onClick={mobileToggle}>
              <ClearIcon />
            </IconButton>
          </div>
        )}
      </div>

      <List className={styles.menuContainer}>

        {menuItems.map(({ text, icon, href, children }) => {
          const isOpen = openMenus[text] || false;
          const isActive = href && pathname === href;
          const isChildActive = children?.some(child => child.href === pathname);

          if (children) {
            return (
              <div key={text}>
                <Tooltip title={!open && !mobileOpen ? text : ''} placement="right" arrow>
                  <ListItem
                    button
                    onClick={() => toggleMenu(text)}
                    className={`${styles.menuItem} ${isOpen ? styles.open : ''} ${isActive && !isChildActive ? styles.active : ''}`}
                  >
                    <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
                    <ListItemText
                      disableTypography
                      className={styles.listItemText}
                      primary={<span className={styles.text}>{text}</span>}
                    />
                    {isOpen ? <ExpandLess className={styles.icon} /> : <ExpandMore className={styles.icon} />}
                  </ListItem>
                </Tooltip>

                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className={styles.submenuList}>
                    {children.map(({ text: childText, href: childHref }) => {
                      const isChildActive = pathname === childHref;
                      return (
                        <ListItem
                          key={childText}
                          button
                          onClick={() => {
                            router.push(childHref);
                            setMobileOpen(false);
                          }}
                          className={`${styles.menuItem} ${styles.submenuItem} ${isChildActive ? styles.active : ''}`}
                        >
                          <ListItemText
                            disableTypography
                            className={styles.listItemText}
                            primary={<span className={styles.text}>{childText}</span>}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </div>
            );
          }

          return (
            <Tooltip key={text} title={!open && !mobileOpen ? text : ''} placement="right" arrow>
              <ListItem
                button
                onClick={() => {
                  router.push(href);
                  setMobileOpen(false);
                }}
                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
              >
                <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
                <ListItemText
                  disableTypography
                  className={styles.listItemText}
                  primary={<span className={styles.text}>{text}</span>}
                />
              </ListItem>
            </Tooltip>
          );
        })}



      </List>

      <div className={styles.footer}>
        {/* {isCandidate &&
          (<div className={styles.profileCompletion}>
            <div className={styles.percentage}>75%</div>
            <div className={styles.progressBar}>
              <div className={styles.progress} />
            </div>
            <div className={`${styles.label} ${!open ? styles.hideOnDesktop : ''}`}>
              Profile Complete
            </div>
          </div>)} */}
          {isCandidate && (
          <div className={styles.profileCompletion}>
            <div className={styles.percentage}>{profileCompleteness}%</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <div className={`${styles.label} ${!open ? styles.hideOnDesktop : ''}`}>
              Profile Complete
            </div>
          </div>
        )}

        <List className={styles.menuContainer}>
          <LogoutButton open={open} mobileOpen={mobileOpen} styles={styles} />
        </List>
        {mobileOpen && <FindJobButton styles={styles} />}
      </div>
    </>
  );
}

