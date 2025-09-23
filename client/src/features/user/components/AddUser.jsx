"use client";
import React, { useState } from "react";
import GenericFormikForm from "@/components/form/GenericFormikForm";
import { useAddser } from "../hooks/users.hooks";
import { userValidationSchema } from "../validations/users.validations";
import { addUserFields } from "./AddUser.fields";
import GenericCard from "@/components/ui/surfaces/Card";

export default function AddUser({ styles }) {
    const [open, setOpen] = useState(false);
    const { mutate: addUser, isLoading } = useAddser();

    const handleClose = () => setOpen(false);

    const initialValues = {
        fullName: "",
        email: "",
        dateOfBirth: "",
        phone: "",
        country: "",
        roles: "",
    };


    const handleSubmit = (values, { resetForm }) => {
        addUser(values, {
            onSuccess: () => {
                resetForm();
                handleClose();
            },
        });
    };

    return (
        <div className={styles.usersContainer}>
            <GenericCard styles={styles} className={styles.adduserCard}>

                <GenericFormikForm
                    initialValues={initialValues}
                    validationSchema={userValidationSchema}
                    onSubmit={handleSubmit}
                    fields={addUserFields}
                    isSubmitting={isLoading}
                    submitText="Create"
                    formClassName={styles.form}
                    submitFullWidth={true}
                    styles={styles} 

                />
            </GenericCard>
        </div>
    );
}

