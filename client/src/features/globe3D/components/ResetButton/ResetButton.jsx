"use client";
import React from "react";
import styles from "./ResetButton.module.scss";

export default function ResetButton({ onReset, top }) {
  return (
    <button
      className={styles.button}
      style={{ top }}
      onClick={onReset}
    >
      Reset
    </button>
  );
}
