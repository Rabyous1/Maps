"use client";
import React from "react";
import styles from "./ModeToggle.module.scss";

export default function ModeToggle({ isLight, toggleMode, top }) {
  return (
    <button
      className={styles.button}
      style={{ top }}
      onClick={toggleMode}
    >
      {isLight ? "Mode Dark" : "Mode Light"}
    </button>
  );
}
