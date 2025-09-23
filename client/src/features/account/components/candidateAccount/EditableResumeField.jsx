import React from "react";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EditableResumeField({ value, onChange }) {
  const fileName = value ? value.split("/").pop() : null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // You might need to handle uploading the file to your backend here
      onChange(file); // temporarily just store the File object
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div>
      {value && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{fileName}</span>
          <IconButton size="small" color="error" onClick={handleRemove}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      )}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        style={{ marginTop: "8px" }}
      />
    </div>
  );
}
