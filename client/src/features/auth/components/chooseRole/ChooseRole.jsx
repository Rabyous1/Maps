"use client";
import React, { useState } from "react";
import ArrowLeft from '@/assets/icons/chooseRole/arrow-circle-left.svg';
import Image from "next/image";
import GenericCheckbox from "@/components/ui/inputs/GenericCheckbox";
import SpeechBubble from "@/components/ui/surfaces/SpeechBubble";
import { rolesData } from './rolesData';
import { useChooseRole } from "../../hooks/auth.hooks";
import { chooseRoleValidationSchema } from "../../validations/auth.validations";
import { useRoleRedirect } from "@/helpers/redirections";

export default function ChooseRole({ styles }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [validationError, setValidationError] = useState("");
  const { mutate: chooseRole } = useChooseRole();
  useRoleRedirect();

  const roleMap = {
    Candidate: "Candidat",
    Recruiter: "Recruteur",
  };

  const onSelectRole = (roleName) => {
    setSelectedRole(roleName);
    setValidationError(""); 
  };

  const onContinue = () => {
    const mappedRole = roleMap[selectedRole];
  
    chooseRoleValidationSchema()
      .validate({ role: mappedRole })
      .then(() => {
        chooseRole(mappedRole); 
      })
      .catch((error) => {
        setValidationError(error.message);
      });
  };
  

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.title}>Please choose your role to begin</p>
      </div>

      {rolesData.map(({ key, image, alt, bubbleText, checkboxName, checkboxLabel }, idx) => (
        <div key={key} className={idx === 0 ? styles.left : styles.right}>
          <div className={styles.content}>
            <SpeechBubble className={styles.bubble} styles={styles} text={bubbleText} />
            <Image
              src={image}
              alt={alt}
              className={idx === 0 ? styles.CandidateImage : styles.RecruiterImage}
              priority
            />
          </div>
          <div className={styles.footer}>
            <div className={styles.checkboxWrapper}>
              <GenericCheckbox
                name="role"
                label={checkboxLabel}
                required={true}
                styles={styles}
                checked={selectedRole === checkboxName}
                onChange={() => onSelectRole(checkboxName)}
              />
            </div>

            {idx === 1 && (
              <div>
                <button
                  disabled={!selectedRole}
                  className={styles.continueLink}
                  onClick={onContinue}
                  type="button"
                >
                  <span className={styles.text}>Continue</span>
                  <ArrowLeft className={styles.arrowLeft} />
                </button>

                {/* Inline validation message */}
                {validationError && (
                  <p className={styles.validationError}>{validationError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
