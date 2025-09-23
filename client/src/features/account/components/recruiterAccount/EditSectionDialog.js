"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GenericTextField from "@/components/ui/inputs/Textfield";
import Select from "@/components/ui/inputs/Select";

export default function EditSectionDialog({
  open,
  section,
  user = {},
  onClose,
  onSave,
  styles,
}) {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!section) return;
    const initial = {};
    (section.fields || [])
      .filter((field) => field.key !== "profilePicture" && field.key !== "fiscalNumber")
      .forEach((f) => {
        initial[f.key] = user?.[f.key] ?? "";
      });
    setValues(initial);
  }, [section, user]);

  if (!section) return null;

  const handleChange = (key) => (e) => {
    const val = e?.target?.value;
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    const payload = { ...values };
    delete payload.profilePicture;
    delete payload.fiscalNumber;

    if (payload.recruiterSummary && typeof payload.recruiterSummary === "string") {
      payload.recruiterSummary = payload.recruiterSummary.trim();
    }

    onSave?.(section.key, payload);
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      className={styles?.dialogEditRecruiter}
    >
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className={styles.dialogTitle}>{section.title || "Edit"}</span>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <div style={{ display: "grid", gap: 12 }}>
          {section.fields
            .filter((field) => field.key !== "profilePicture" && field.key !== "fiscalNumber")
            .map((field) => {
              const multiline =
                field.key === "summary" ||
                field.key === "recruiterSummary" ||
                field.multiline === true;

              if (field.type === "select") {
                return (
                  <Select
                    key={field.key}
                    name={field.key}
                    label={field.label || field.key}
                    value={values[field.key] ?? ""}
                    onChange={handleChange(field.key)}
                    options={field.options || []}
                    placeholder={field.placeholder}
                    styles={styles}
                  />
                );
              }

              return (
  <GenericTextField
    key={field.key}
    name={field.key}
    label={field.label || field.key}
    value={values[field.key] ?? ""}
    onChange={handleChange(field.key)}
    multiline={multiline}
    minRows={field.minRows}
    maxRows={field.maxRows}
    type={field.type || "text"}
    variant="outlined"
    placeholder={field.placeholder}
    styles={styles}
    labelClassName={styles.labelCustom}
  />



              );
            })}
        </div>
      </DialogContent>

      <DialogActions className={styles.actionButtons}>
        <Button onClick={onClose} className={styles.cancelButton}>Cancel</Button>
        <Button onClick={handleSave} className={styles.submitButton}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
