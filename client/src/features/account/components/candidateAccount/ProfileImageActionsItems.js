import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

export const getMenuItems = (styles) => [
  {
    key: "changeImage",
    label: "Change the image",
    icon: <EditIcon fontSize="small" />,
  },
  {
    key: "saveImage",
    label: "Save the image",
    icon: <SaveAltIcon fontSize="small" />,
  },
  {
    key: "deleteImage",
    label: "Delete the image",
    icon: <DeleteIcon fontSize="small" />,
    iconClassName: styles.deleteIcon,
    textClassName: styles.deleteText,
  },
];
