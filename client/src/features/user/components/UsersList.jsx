"use client";

import React, { useState } from "react";
import { useQuery } from "react-query";
import { Box, CircularProgress } from "@mui/material";
import { getAllUsers } from "../services/users.services";
import Table from "@/components/ui/inputs/GenericTable";
import { getUserColumns } from "./UsersList.columns";
import { useDeleteUser, useRecoverUser, useUpdateUser } from "../hooks/users.hooks";
import GenericAlert from "@/components/ui/feedback/Alert";
import GenericDialog from "@/components/ui/feedback/Dialog";
import GenericFormikForm from "@/components/form/GenericFormikForm";
import { userValidationSchema } from "../validations/users.validations";
import GenericCard from "@/components/ui/surfaces/Card";
import DeleteConfirmationDialog from "@/components/dialogs/DeleteConfirmationDialog";
import RecoverConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { addUserFields, updateUserFields } from "./AddUser.fields";

const UsersTable = ({ styles }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recoverDialogOpen, setRecoverDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isLoading, isError } = useQuery(
    ["users", paginationModel],
    () =>
      getAllUsers({
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      }),
    { keepPreviousData: true }
  );

  const { mutate: deleteUserMutation } = useDeleteUser();
  const { mutate: updateUserMutation } = useUpdateUser();
  const { mutate: recoverUserMutation } = useRecoverUser();

  // Delete
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = () => {
    if (selectedUser) deleteUserMutation(selectedUser.id);
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // Recover
  const handleRecoverClick = (user) => {
    setSelectedUser(user);
    setRecoverDialogOpen(true);
  };
  const handleConfirmRecover = () => {
    if (selectedUser) recoverUserMutation(selectedUser.id);
    setRecoverDialogOpen(false);
    setSelectedUser(null);
  };
  const handleCancelRecover = () => {
    setRecoverDialogOpen(false);
    setSelectedUser(null);
  };

// Update
const handleUpdate = (user) => {
  console.log("handleUpdate called with:", user);
  setSelectedUser(user);
  setDialogOpen(true);
};

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };
const handleSubmit = (values, { setSubmitting }) => {
  console.log("Form values:", values);

  updateUserMutation({ id: selectedUser.id, values });

  // let the mutation's onSuccess/onError (from useUpdateUser) handle alerts
  setSubmitting(false);
  handleDialogClose();
};



  if (isLoading) return <Box><CircularProgress /></Box>;
  if (isError) return <Box>Error fetching users.</Box>;

  return (
    <>
      <h2 className={styles.uersTitle}>Users List</h2>
      <GenericCard styles={styles} className={styles.usersListCard}>
        <Table
          columns={getUserColumns(styles,handleDeleteClick, handleUpdate, handleRecoverClick)}
          data={data?.users.map((user, index) => ({
            ...user,
            rowIndex: paginationModel.page * paginationModel.pageSize + index + 1,
          })) || []}
          paginationModel={{ page: data?.pageNumber - 1, pageSize: data?.pageSize }}
          totalRows={data?.totalUsers || 0}
          onPaginationChange={setPaginationModel}
          styles={styles}
        />


<GenericDialog open={dialogOpen} onClose={handleDialogClose} title="Update User" styles={styles}  PaperProps={{ className: styles.dialogPaper }}>
  
  {selectedUser && (
    
    <GenericFormikForm
      styles={styles}
      initialValues={{
        fullName: selectedUser.fullName || "",
        email: selectedUser.email || "",
        phone: selectedUser.phone || "",
        country: selectedUser.country || "",
        dateOfBirth: selectedUser.dateOfBirth || "",
      }}
      validationSchema={userValidationSchema}
      onSubmit={handleSubmit}
      fields={updateUserFields}
      submitText="Update"
      onCancel={handleDialogClose}
      cancelText="Cancel"
      
    />
  )}
</GenericDialog>




        {/* Delete Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          itemName={selectedUser?.fullName}
          onDelete={handleConfirmDelete}
        />

        {/* Recover Dialog */}
        <RecoverConfirmationDialog
          open={recoverDialogOpen}
          onClose={handleCancelRecover}
          itemName={selectedUser?.fullName}
          onRecover={handleConfirmRecover}
        />

        <GenericAlert />
      </GenericCard>
    </>
  );
};

export default UsersTable;
