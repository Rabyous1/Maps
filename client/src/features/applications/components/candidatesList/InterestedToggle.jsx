"use client";

import React from "react";
import NotInterestedIcon from "@/assets/icons/candidates/close-icon.svg";
import MaybeIcon from "@/assets/icons/candidates/question-icon.svg";
import InterestedIcon from "@/assets/icons/candidates/check-icon.svg";

const InterestedToggle = ({ styles, value, onChange }) => {
  const statuses = [
    {
      key: "Interested",
      icon: <InterestedIcon className={styles.icon} />,
    },
    {
      key: "Maybe",
      icon: <MaybeIcon className={styles.icon} />,
    },
    {
      key: "Not Interested",
      icon: <NotInterestedIcon className={styles.icon} />,
    },
  ];

  return (
    <div className={styles.container}>
      {statuses.map(({ key, icon }) => {
        const isSelected = value === key;
        const statusClass = styles[key.replace(" ", "")];

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={isSelected}
            className={`${styles.iconButton} ${isSelected ? statusClass : ""}`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
};

export default InterestedToggle;
