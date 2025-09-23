"use client";
import React from "react";
import GenericCard from "@/components/ui/surfaces/Card";
import EditIcon from "@/assets/icons/actions/edit-icon.svg";
import { Button } from "@mui/material";

export default function AccountCard({
  title,
  children,
  className,
  styles,
  onEdit,
  hideEdit = false 
}) {
  return (
    <GenericCard
      title={
        <>
          <h3 className={styles.title}>{title}</h3>
          {!hideEdit && onEdit && (
            <Button className={styles.editButton} onClick={onEdit}>
              <EditIcon className={styles.icon} />
              <span>Edit</span>
            </Button>
          )}
        </>
      }
      styles={styles}
      className={className}
    >
      {children}
    </GenericCard>
  );
}
