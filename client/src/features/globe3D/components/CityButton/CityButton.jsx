import React from "react";
import styles from "./CityButton.module.scss";

export default function CityButton({ label, onClick, top }) {
  return (
    <button className={styles.button} onClick={onClick} style={{ top }}>
      {label}
    </button>
  );
}
