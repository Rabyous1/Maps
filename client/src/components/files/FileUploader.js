import React, { useRef, useImperativeHandle } from "react";

const FileUploader = React.forwardRef(({ onUpload, accept, className, children }, ref) => {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({ open: () => inputRef.current?.click() }));

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await onUpload(file);
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        className={className}
      />
      {children && (
        <div onClick={() => inputRef.current?.click()}>
          {children}
        </div>
      )}
    </>
  );
});

export default FileUploader;
