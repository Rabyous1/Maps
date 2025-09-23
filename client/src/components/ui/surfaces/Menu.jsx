import React from "react";
import {
  Menu,
  MenuList,
  MenuItem,
  ListItemIcon,
} from "@mui/material";

const GenericMenu = ({
  anchorEl,
  open,
  onClose,
  menuItems,
  onItemClick,
  menuPaperClass,
  children
}) => {
  const handleClick = (item) => {
    onItemClick(item);  
    onClose();         
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{ className: menuPaperClass }}
    >
      <MenuList>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleClick(item)}
            className={item.itemclassName}
          >
            <ListItemIcon  className={item.iconClassName}>
              {item.icon}
            </ListItemIcon>
            <span className={item.textClassName}>{item.label}</span>
          </MenuItem>
        ))}
      </MenuList>
      {children}
    </Menu>
  );
};

export default GenericMenu;
