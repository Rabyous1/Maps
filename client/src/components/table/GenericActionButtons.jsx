"use client";
import React from "react";
import { FixedSizeList as List } from "react-window";
import { IconButton, Tooltip, Button } from "@mui/material";

const GenericActionButtons = ({
    actions = [],
    reverse = false,
    variant = "icon", 
    height = 60,
    width = 200,
    itemSize = 60,
    layout = "horizontal",
    hideScrollbar = false,
}) => {
    const items = reverse ? [...actions].reverse() : actions;
    const isIconOnly = variant === "icon";

    const Row = ({ index }) => {
        const btn = items[index];

        return (
            <Tooltip title={btn.label || ""} arrow disableHoverListener={!isIconOnly}>
                <span>
                    {isIconOnly ? (
                        <IconButton
                            size="small"
                            onClick={btn.onClick}
                            disabled={btn.disabled || btn.loading}
                            color={btn.color || "default"}
                        >
                            {btn.loading ? "..." : btn.icon}
                        </IconButton>
                    ) : (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={btn.icon}
                            onClick={btn.onClick}
                            disabled={btn.disabled || btn.loading}
                            color={btn.color || "primary"}
                        >
                            {btn.loading ? "Loading..." : btn.label}
                        </Button>
                    )}
                </span>
            </Tooltip>
        );
    };

    return (
        <List
            height={height}
            itemCount={items.length}
            itemSize={itemSize}
            width={width}
            layout={layout}
            style={{
                overflow: hideScrollbar ? "hidden" : "auto",
            }}
        >
            {Row}
        </List>
    );
};

export default GenericActionButtons;
