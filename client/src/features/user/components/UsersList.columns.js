
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { IconButton, Tooltip } from "@mui/material";

export const getUserColumns = (styles, onDelete, onUpdate, onRecover) => [
  {
    field: "rowIndex",
    headerName: "#",
    flex: 0.5,
    renderCell: (params) => <span style={{ color: "#797EFF" }}>{params.value}</span>
  },
  { field: "fullName", headerName: "Fullname", flex: 1, type: "text" },
  { field: "email", headerName: "Email", flex: 1, type: "text" },
  { field: "roles", headerName: "Role", flex: 1 },
  { field: "dateOfBirth", headerName: "Date of birth", flex: 1 , type: "text"},
  { field: "phone", headerName: "Phone Number", flex: 1 , type: "text"},
  { field: "country", headerName: "Country", flex: 1 , type: "text"},
{
  field: "isVerified",
  headerName: "Verified",
  flex: 0.5,
  renderCell: (params) => (
    <span className={params.value ? styles.checkText : styles.crossText}>
      {params.value ? "✓" : "✗"}
    </span>
  ),
},
{
  field: "isArchived",
  headerName: "Archived",
  flex: 0.5,
  renderCell: (params) => (
    <span className={params.value ? styles.checkText : styles.crossText}>
      {params.value ? "✓" : "✗"}
    </span>
  ),
},
{
  field: "isCompleted",
  headerName: "Completed",
  flex: 0.5,
  renderCell: (params) => (
    <span className={params.value ? styles.checkText : styles.crossText}>
      {params.value ? "✓" : "✗"}
    </span>
  ),
},


  {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const isArchived = params.row.isArchived;

      return (
        <>
          {!isArchived ? (
            <div className={styles.actionsColumn}>
              <Tooltip title="Edit User">
                 <IconButton onClick={() => {
               console.log("Edit icon clicked, row:", params.row);
               onUpdate(params.row);
            }}>
                  <EditIcon className={styles.editIcon} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete User">
                <IconButton onClick={() => onDelete(params.row)}>
                  <DeleteIcon className={styles.deleteIcon} />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <div className={styles.actionsColumn}>
              <Tooltip title="Edit User">
                <IconButton onClick={() => onUpdate(params.row)}>
                  <EditIcon className={styles.editIcon} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Recover User">
                <IconButton onClick={() => onRecover(params.row)}>
                  <RestoreIcon className={styles.recoverIcon} />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </>
      );
    },
  }
];
