"use client";
import React from "react";
import GenericAlert from "@/components/ui/feedback/Alert";
import { basicInfosSections, languageSections, profileSections } from "./ProfileSections";
import SectionList from "./SectionList";

export default function AccountForm({ styles }) {
  return (
    <div className={styles.profileWrapper}>
      <GenericAlert />

      <div className={styles.left}>
        <SectionList sections={basicInfosSections} styles={styles} />

        <SectionList
          sections={languageSections}
          cardClass={styles.languageLeft}
          styles={styles}
        />
      </div>

      <div className={styles.right}>
        <SectionList sections={profileSections} styles={styles} />

        <SectionList
          sections={languageSections}
          cardClass={styles.languageRight}
          styles={styles}
        />
      </div>
    </div>
  );
}
