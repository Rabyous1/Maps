import LockIcon from "@/assets/images/svg/settings/padlock.svg";
import QrIcon from "@/assets/images/svg/settings/qrCode.svg";
import TrashIcon from "@/assets/images/svg/settings/trash.svg";

export const settingsCards = (styles, handlers, twoFactorEnabled) => [
  {
    key: "password",
    title: "Password",
    description: "Create a strong and unique password to secure your account.",
    button: "Change Password",
    onClick: handlers.handleChangePassword,
    SvgIcon: LockIcon,
    buttonClassName: styles.passwordButton,
  },
  {
    key: "qr",
    title: "Two-Factor Authentication",
    description: twoFactorEnabled
      ? "2FA is enabled. You can disable it if you wish."
      : "Protect your account by enabling 2FA with QR code.",
    button: twoFactorEnabled ? "Disable" : "Activate",
    onClick: twoFactorEnabled ? handlers.handleDisable2FA : handlers.handleActivateQr,
    SvgIcon: QrIcon,
    buttonClassName: styles.qrButton,
  },
  {
    key: "delete",
    title: "Delete Account",
    description: "Want to leave? Delete your Maps account permanently.",
    button: "Delete Account",
    onClick: handlers.handleDeleteAccount,
    SvgIcon: TrashIcon,
    isActionButton: true,
    buttonClassName: styles.deleteAccountButton,
  },
];
