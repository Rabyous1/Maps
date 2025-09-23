import React from 'react';

export default function SectionRenderer({ section, styles, user }) {
  const { title, fields = [], EmptyComponent } = section;

  const hasContent = fields?.some((field) => user?.[field.key] !== undefined);

  return (
    <div className={styles.section}>
      {title && <h3 className={styles.subSectionTitle}>{title}</h3>}

      {hasContent ? (
        <div className={styles.fieldsWrapper}>
          {fields.map((field) => {
            const IconComponent = field.icon;
            return (
              <div key={field.key} className={styles.field}>
                {IconComponent && <IconComponent className={styles.icon} />}
                <span className={styles.label}>{field.label || field.key}</span>
                <span className={styles.value}>{user?.[field.key] || '—'}</span>
              </div>
            );
          })}
        </div>
      ) : (
        EmptyComponent && <EmptyComponent />
      )}
    </div>
  );
}
