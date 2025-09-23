
"use client";
import React, { useState, useRef } from "react";
import { Avatar, Badge, Tooltip, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import FileUploader from "@/components/files/FileUploader";
import GenericMenu from "@/components/ui/surfaces/Menu";
import { useDeleteFile, useGetFile, useSaveFile } from "@/features/files/hooks/files.hooks";
import GenericDialog from "@/components/ui/feedback/Dialog";
import DeleteConfirmationDialog from "@/components/dialogs/DeleteConfirmationDialog";
import { getMenuItems } from "./ProfileImageActionsItems";
import { useQueryClient } from "react-query";

const ProfileImage = ({ currentUser, styles, onProfileDeleted, onProfileUpdated }) => {
  const queryClient = useQueryClient();
  const filename = currentUser?.profilePicture?.split("/").pop();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const uploaderRef = useRef(null);
  const isMenuOpen = Boolean(anchorEl);
  const saveFileMutation = useSaveFile();
  const deleteFileMutation = useDeleteFile();
  const { data: imageUrl } = useGetFile(filename);
  const menuItems = getMenuItems(styles);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const currentYear = new Date().getFullYear().toString();
      const result = await saveFileMutation.mutateAsync({
        userId: currentUser?.id,
        resource: "avatar",
        folder: currentYear,
        filename: file.name,
        body: { formData },
      });
      setAnchorEl(null);
      queryClient.invalidateQueries(["files", file.name]);
      queryClient.invalidateQueries(["currentUser"]);
      onProfileUpdated?.(file.name);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMenuItemClick = (item) => {
    if (item.key === "changeImage") {
      uploaderRef.current?.open();
    }
    if (item.key === "deleteImage") {
      setOpenDeleteDialog(true);
    }
    setAnchorEl(null);
  };

  const handleConfirmDelete = () => {
    if (!filename) return;
    deleteFileMutation.mutate(
      { filename },
      {
        onSuccess: () => {
          setOpenDeleteDialog(false);
          setOpenDialog(false);
          queryClient.invalidateQueries(["currentUser"]);
          onProfileDeleted?.();
        },
      }
    );
  };

  const moreIconButton = (
    <IconButton
      onClick={(e) => setAnchorEl(e.currentTarget)}
      className={styles.moreIcon}
    >
      <MoreIcon />
    </IconButton>
  );

  return (
    <>
      <FileUploader
        className={styles.fileUploader}
        ref={uploaderRef}
        accept="image/jpeg, image/jpg, image/png, image/gif, image/bmp, image/svg+xml"
        onUpload={handleFileUpload}
      />

      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <Tooltip title="Change profile picture">
            <AddIcon
              className={styles.profileImageBadge}
              onClick={() => uploaderRef.current?.open()}
            />
          </Tooltip>
        }
      >
        <Avatar
          src={imageUrl || undefined}
          alt="Profile"
          className={styles.profileImage}
          onClick={() => imageUrl && setOpenDialog(true)}
        />
      </Badge>

      <GenericDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={moreIconButton}
        showCloseIcon
        styles={styles}
        // PaperProps={{ className: styles.dialogPaper }}
        PaperProps={{
  sx: {
    p: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
    maxWidth: '100vw',
    maxHeight: '100vh',
    width: { xs: '240px', sm: '360px', md: '400px', lg: '450px' },
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    backgroundColor: 'var(--dialog-image-color)'
  }
}}

      >
        <div className={styles.dialogContent}>
          <img
            src={imageUrl}
            alt="Enlarged Profile"
            className={styles.enlargedProfileImage}
          />
        </div>

        <GenericMenu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={() => setAnchorEl(null)}
          menuItems={menuItems}
          onItemClick={handleMenuItemClick}
          menuPaperClass={styles.menuPaper}
        />
      </GenericDialog>

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        itemName={"your profile image"}
        onDelete={handleConfirmDelete}
      />
    </>
  );
};

export default ProfileImage;