import React, { useState, useCallback } from "react";
import GenericButton from "@/components/ui/inputs/Button";

const EmptyState = ({
    icon: Icon,
    iconClass,
    title,
    subtitle,
    buttonText,
    styles,
    titleClass,
    subtitleClass,
    buttonClass,
    DialogComponent,
}) => {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);
    const clickableTitle = !buttonText;

    return (
        <>
            {Icon && <Icon className={styles[iconClass]} />}
            {title && (
                <p
                    className={styles[titleClass]}
                    onClick={clickableTitle ? handleOpen : undefined}
                >
                    {title}
                </p>
            )}
            {subtitle && <p className={styles[subtitleClass]}>{subtitle}</p>}
            {buttonText && (
                <GenericButton
                    className={styles[buttonClass]}
                    onClick={handleOpen}
                >
                    {buttonText}
                </GenericButton>
            )}
            {DialogComponent && (
                <DialogComponent open={open} onClose={handleClose} />
            )}
        </>
    );
};

export default EmptyState;
