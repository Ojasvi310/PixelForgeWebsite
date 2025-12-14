// //Editor.jsx
import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

export default function Editor({ code, filename }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    const editor = monaco.editor.create(ref.current, {
      value: code,
      language: filename.endsWith(".css")
        ? "css"
        : filename.endsWith(".js")
        ? "javascript"
        : "html",
      automaticLayout: true,
      minimap: { enabled: false },
      readOnly: false,
    });
    return () => editor.dispose();
  }, [code, filename]);

  return (
    <div
      ref={ref}
      className="h-56 border border-cyan-500/50 rounded-lg"
    />
  );
}

// import React, { useEffect, useRef } from "react";
// import * as monaco from "monaco-editor";

// export default function Editor({ code, filename }) {
//   const ref = useRef();

//   useEffect(() => {
//     if (!ref.current) return;
//     const editor = monaco.editor.create(ref.current, {
//       value: code,
//       language: filename.endsWith(".css") ? "css" :
//                 filename.endsWith(".js") ? "javascript" : "html",
//       automaticLayout: true,
//       minimap: { enabled: false },
//       readOnly: false
//     });
//     return () => editor.dispose();
//   }, [code, filename]);

//   return <div ref={ref} style={{ height: 240, border: "1px solid rgba(204, 102, 102, 1)" }} />;
// }
