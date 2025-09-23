import React, { useState } from 'react';
import { Button } from '@mui/material';
import GenericDialog from '../ui/feedback/Dialog';

const ConfirmationAlert = ({ open, onClose, onConfirm, onCancel, title = "Are you sure?", message = "Are you sure you want to proceed with this action?" }) => {
    const actions = (
        <>
            <Button onClick={onCancel} color="primary">
                Cancel
            </Button>
            <Button onClick={onConfirm} color="primary">
                Confirm
            </Button>
        </>
    );

    return (
        <GenericDialog
            open={open}
            onClose={onClose}
            title={title}
            actions={actions}
        >
            <p>{message}</p>
        </GenericDialog>
    );
};

export default ConfirmationAlert;
