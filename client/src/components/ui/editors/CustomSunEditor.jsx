"use client";

import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

import plugins from "suneditor/src/plugins";

export default function CustomSunEditor({
  content = "",
  onChange,
  onPaste,
  height = "180px",
  maxHeight = "400px",
  showCharCount = true,
  buttonList = null,
  className
}) {
  return (
    <SunEditor
     className={className}
      setContents={content}
      onChange={onChange}
      onPaste={onPaste}
      setOptions={{
        plugins,
        cleanHTML: false,
        disableHtmlSanitizer: true,
        minHeight: height,
        maxHeight: maxHeight,
        resizingBar: false,

        defaultTag: "div",  

        formats: ["div","h4", "h5", "h6"],

        showPathLabel: false,
        charCounter: showCharCount,
        charCounterType: "byte",
        font: ["Inter", "Quicksand"],
        // colorList: [
        //   ["#797EFF", "#28708E", "#EFF1FF", "#06174A", "#CC3233", "#FF2A27"],
        //   ["#000000", "#ffffff", "#f1f1f1", "#D5D9E3", "#EED600", "#FFD166"],
        // ],
        addTagsWhitelist:
          "h1|h2|h3|h4|h5|h6|p|div|span|strong|em|ul|li|ol|a|br|hr",
        buttonList:
          buttonList || [
            ["undo", "redo"],

            ["formatBlock"],                

            ["font"],     

            ["bold", "underline", "italic", "strike"],
            // ["fontColor", "hiliteColor"],
            ["align", "list", "lineHeight"],
            ["outdent", "indent"],
            ["horizontalRule", "link"],
            ["fullScreen", "showBlocks", "codeView", "preview"],
            ["removeFormat"],
          ],
      }}
    />
  );
}
