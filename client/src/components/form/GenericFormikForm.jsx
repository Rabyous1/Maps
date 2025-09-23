"use client";

import React from "react";
import { Formik, Form, useFormikContext, FieldArray } from "formik";
import GenericTextField from "../../components/ui/inputs/Textfield";
import Select from "../../components/ui/inputs/Select";
import GenericCheckbox from "../../components/ui/inputs/GenericCheckbox";
import GenericButton from "@/components/ui/inputs/Button";
import GenericDatePicker from "../../components/ui/inputs/DatePicker";
import GenericPhoneInput from "@/components/ui/inputs/PhoneInput";
import CustomSunEditor from "../ui/editors/CustomSunEditor";
import RemoveIcon from '@/assets/icons/actions/remove-icon.svg';
import AddIcon from "@/assets/icons/actions/add-icon.svg";

import { Button } from "@mui/material";
import ResumeFileUploader from "@/features/account/components/candidateAccount/ResumeFileUploader";

const COMPONENT_MAP = {
  text: GenericTextField,
  email: GenericTextField,
  password: GenericTextField,
  date: GenericDatePicker,
  tel: GenericPhoneInput,
  select: Select,
  checkbox: GenericCheckbox,
};

function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path
    .split(/\.|\[|\]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function FieldRenderer({ fieldDef, styles, className, arrayIndex = null }) {
  const { name, label, type, required, options: staticOptions = [], placeholder, ...rest } = fieldDef;
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext();

  const value = getNestedValue(values, name);
  const isError = getNestedValue(touched, name) && Boolean(getNestedValue(errors, name));
  const helperText = getNestedValue(touched, name) && getNestedValue(errors, name);
  const Component = COMPONENT_MAP[type] || GenericTextField;
  const commonProps = {
    name,
    label,
    required,
    onBlur: handleBlur,
    error: isError,
    helperText,
    placeholder,
    styles,
    labelClassName: styles.label,
    className,
    ...rest,
  };

  if (type === "checkbox") {
    return (
      <div className={styles.checkbox}>
        <Component {...commonProps} checked={!!value} onChange={handleChange} />
        {fieldDef.extra?.label && fieldDef.extra?.href && (
          <a href={fieldDef.extra.href} className={styles.forgetlink}>
            {fieldDef.extra.label}
          </a>
        )}
      </div>
    );
  }

  if (type === "select") {
    // compute options: prefer dynamicOptions(values, arrayIndex) if provided
    let computedOptions = staticOptions || [];
    try {
      if (typeof fieldDef.dynamicOptions === "function") {
        const maybe = fieldDef.dynamicOptions(values, arrayIndex);
        if (Array.isArray(maybe)) computedOptions = maybe;
      }
    } catch (e) {
      // fail silently and fallback to staticOptions
      console.error("Error while computing dynamicOptions for", name, e);
      computedOptions = staticOptions || [];
    }

    const onChangeFn = rest.onChange
      ? (e) => rest.onChange(e, setFieldValue)
      : (e) => {
          // support event-like objects or direct values
          const newValue = e && e.target !== undefined ? e.target.value : e;
          setFieldValue(name, newValue);
        };

    return (
      <Component
        {...commonProps}
        value={value === undefined ? "" : value}
        options={computedOptions}
        onChange={onChangeFn}
      />
    );
  }

  if (type === "editor") {
    return (
      <div className={`${styles.editorWrapper} ${className || ""}`}>
        {label && <label className={styles.label}>{label}</label>}
        <CustomSunEditor
          content={value}
          onChange={(val) => setFieldValue(name, val)}
          className={styles.editor}
        />
        {isError && <div className={styles.errorText}>{helperText}</div>}
      </div>
    );
  }

  if (type === "file") {
    return (
      <ResumeFileUploader
        styles={styles}
        onResumeUpdated={(filename) => {
          setFieldValue(name, filename);
        }}
        onResumeDeleted={() => {
          setFieldValue(name, "");
        }}
      />
    );
  }

  return (
    <Component
      {...commonProps}
      value={value === undefined ? "" : value}
      type={type}
      inputRootClass={styles.inputRoot}
      inputOutlineClass={styles.inputOutline}
      inputFocusedClass={styles.inputFocused}
      onChange={handleChange}
    />
  );
}

export default function GenericFormikForm({
  initialValues,
  validationSchema,
  onSubmit,
  fields,
  submitText,
  isSubmitting,
  submitFullWidth = false,
  styles = {},
  onCancel,
  cancelText,
  cancelFullWidth = false,
  formClassName,
  hideSubmitButton = false,
  customRenderFields,
}) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnBlur
    >
      {({ handleSubmit, values, setFieldValue }) => (
        <Form onSubmit={handleSubmit} className={formClassName || styles.formcontainer}>
          {customRenderFields
            ? customRenderFields({ values, setFieldValue })
            : fields.map((fieldDef) => {
                if (fieldDef.type === "array") {
                  return (
                    <FieldArray
                      key={fieldDef.name}
                      name={fieldDef.name}
                      render={({ push, remove }) => (
                        <div className={styles.arrayFieldWrapper}>
                          {(values[fieldDef.name] || []).map((item, idx) => (
                            <div key={idx} className={styles.arrayItemBlock}>
                              {Array.isArray(fieldDef.itemFields)
                                ? fieldDef.itemFields.map((subDef) => {
                                    const nested = {
                                      ...subDef,
                                      name: `${fieldDef.name}[${idx}].${subDef.key}`,
                                      label: subDef.label,
                                      type: subDef.type || "text",
                                      required: subDef.required,
                                      placeholder: subDef.placeholder,
                                      options: subDef.options,
                                      multiline: subDef.multiline,
                                      rows: subDef.rows,
                                      // preserve dynamicOptions if provided on itemFields
                                      dynamicOptions: subDef.dynamicOptions,
                                    };
                                    return (
                                      <FieldRenderer
                                        key={nested.name}
                                        fieldDef={nested}
                                        styles={styles}
                                        arrayIndex={idx}
                                      />
                                    );
                                  })
                                : (
                                  <FieldRenderer
                                    key={`${fieldDef.name}[${idx}]`}
                                    fieldDef={{
                                      name: `${fieldDef.name}[${idx}]`,
                                      label: fieldDef.label,
                                      type: fieldDef.itemType || "text",
                                      placeholder: fieldDef.placeholder,
                                      required: fieldDef.required,
                                    }}
                                    styles={styles}
                                    arrayIndex={idx}
                                  />
                                )}
                              <Button
                                type="button"
                                startIcon={<RemoveIcon className={styles.removeIcon} />}
                                className={styles.removeItemButton}
                                onClick={() => remove(idx)}
                              >
                                Drop {fieldDef.label || fieldDef.name}
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            startIcon={<AddIcon className={styles.addIcon} />}
                            className={styles.addButton}
                            onClick={() =>
                              push(
                                Array.isArray(fieldDef.itemFields)
                                  ? Object.fromEntries(fieldDef.itemFields.map((f) => [f.key, ""]))
                                  : ""
                              )
                            }
                          >
                            Add {fieldDef.label || fieldDef.name}
                          </Button>
                        </div>
                      )}
                    />
                  );
                }

                return (
                  <FieldRenderer
                    key={fieldDef.name}
                    fieldDef={fieldDef}
                    className={fieldDef.fullWidth ? styles.fullWidth : ''}
                    styles={styles}
                  />
                );
              })}

          {!hideSubmitButton && (submitText || cancelText) && (
            <div className={styles.actionButtons}>
              {onCancel && cancelText && (
                <GenericButton
                  type="button"
                  onClick={onCancel}
                  fullWidth={cancelFullWidth}
                  className={styles.cancelButton}
                >
                  {cancelText}
                </GenericButton>
              )}
              {submitText && (
                <GenericButton
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth={submitFullWidth}
                  className={styles.submitbutton}
                >
                  {submitText}
                </GenericButton>
              )}
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}
