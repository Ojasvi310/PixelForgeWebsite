export default function PreviewFrame() {
  return null;
}

// // import React from "react";
// // import { Sandpack } from "@codesandbox/sandpack-react";

// // export default function PreviewFrame({ files }) {
// //   if (!files || Object.keys(files).length === 0) {
// //     return (
// //       <div className="w-full h-full flex items-center justify-center text-gray-400 border border-gray-700 rounded-lg">
// //         Waiting for generated files...
// //       </div>
// //     );
// //   }

// //   const sandpackFiles = {};
// //   Object.entries(files).forEach(([path, code]) => {
// //     const filePath = path.startsWith("/") ? path : "/" + path;
// //     sandpackFiles[filePath] = code;
// //   });

// //   // --- Dynamic main.jsx entry file pointing to components/Main.jsx ---
// //   sandpackFiles["/src/main.jsx"] = `
// // import React from "react";
// // import { createRoot } from "react-dom/client";
// // import Main from "./components/Main"; // backend Main component
// // import "./styles/main.css";

// // const root = createRoot(document.getElementById("root"));
// // root.render(<Main />);
// // `;

// //   // --- Map main.css to index.css for Tailwind ---
// //   if (sandpackFiles["/src/styles/main.css"]) {
// //     sandpackFiles["/src/index.css"] = sandpackFiles["/src/styles/main.css"];
// //   }

// //   return (
// //     <div className="w-full h-full rounded-lg overflow-hidden border border-gray-700 bg-black flex flex-col">
// //       <Sandpack
// //         template="react18"
// //         files={sandpackFiles}
// //         options={{
// //           autorun: true,
// //           showConsole: true,
// //           showNavigator: false,
// //           showTabs: false,
// //         }}
// //         theme="dark"
// //       />
// //     </div>
// //   );
// // }

// // // import React from "react";
// // // import { Sandpack } from "@codesandbox/sandpack-react";

// // // export default function PreviewFrame({ files }) {
// // //   if (!files || Object.keys(files).length === 0) {
// // //     return (
// // //       <div className="w-full h-full flex items-center justify-center text-gray-400 border border-gray-700 rounded-lg">
// // //         Waiting for generated files...
// // //       </div>
// // //     );
// // //   }

// // //   const sandpackFiles = {};
// // //   Object.entries(files).forEach(([path, code]) => {
// // //     const filePath = path.startsWith("/") ? path : "/" + path;
// // //     sandpackFiles[filePath] = code;
// // //   });

// // //   // --- Add dynamic main.jsx ---
// // //   sandpackFiles["/src/main.jsx"] = `
// // // import React from "react";
// // // import { createRoot } from "react-dom/client";
// // // import App from "./App";
// // // import "./styles/main.css";

// // // const root = createRoot(document.getElementById("root"));
// // // root.render(<App />);
// // // `;

// // //   // --- Map main.css to index.css for Tailwind ---
// // //   if (sandpackFiles["/src/styles/main.css"]) {
// // //     sandpackFiles["/src/index.css"] = sandpackFiles["/src/styles/main.css"];
// // //   }

// // //   return (
// // //     <div className="w-full h-full rounded-lg overflow-hidden border border-gray-700 bg-black flex flex-col">
// // //       <Sandpack
// // //         template="react18"
// // //         files={sandpackFiles}
// // //         options={{
// // //           autorun: true,
// // //           showConsole: true,
// // //           showNavigator: false,
// // //           showTabs: false,
// // //         }}
// // //         theme="dark"
// // //       />
// // //     </div>
// // //   );
// // // }

// // // import React from "react";
// // // import { Sandpack } from "@codesandbox/sandpack-react";

// // // export default function PreviewFrame({ files }) {
// // //   if (!files || Object.keys(files).length === 0) {
// // //     return (
// // //       <div className="w-full h-full flex items-center justify-center text-gray-400 border border-gray-700 rounded-lg">
// // //         Waiting for generated files...
// // //       </div>
// // //     );
// // //   }

// // //   // Dynamically map all backend-generated files
// // //   const sandpackFiles = {};
// // //   Object.entries(files).forEach(([path, code]) => {
// // //     const filePath = path.startsWith("/") ? path : "/" + path;
// // //     sandpackFiles[filePath] = code;
// // //   });

// // //   return (
// // //     <div className="w-full h-full rounded-lg overflow-hidden border border-gray-700 bg-black flex flex-col">
// // //       <Sandpack
// // //         template="react18" // Use modern React 18 template
// // //         files={sandpackFiles}
// // //         options={{
// // //           autorun: true,
// // //           showConsole: true,
// // //           showNavigator: false,
// // //           showTabs: false,
// // //         }}
// // //         theme="dark"
// // //       />
// // //     </div>
// // //   );
// // // }
// import React, { useEffect, useRef, useState } from "react";
// import { bundleFiles, initEsbuild } from "./esbuildService";

// export default function PreviewFrame({ files }) {
//   const iframeRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!files || Object.keys(files).length === 0) {
//       setError("Waiting for generated files...");
//       return;
//     }

//     const runPreview = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         // Bundle all JS/JSX
//         const jsCode = await bundleFiles(files);

//         // Combine all CSS
//         const css = Object.entries(files)
//           .filter(([path]) => path.endsWith(".css"))
//           .map(([_, content]) => content)
//           .join("\n");

//         const html = `
//           <!DOCTYPE html>
//           <html lang="en">
//             <head>
//               <meta charset="UTF-8" />
//               <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//               <title>Preview</title>
//               <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.3/dist/tailwind.min.css" rel="stylesheet">
//               <style>${css}</style>
//               <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
//               <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
//             </head>
//             <body>
//               <div id="root"></div>
//               <script type="text/javascript">
//                 try {
//                   ${jsCode}
//                   const Root = typeof App !== 'undefined' ? App : typeof Main !== 'undefined' ? Main : () => <div>No root component found</div>;
//                   const root = ReactDOM.createRoot(document.getElementById('root'));
//                   root.render(<Root />);
//                 } catch(e) {
//                   document.getElementById('root').innerHTML =
//                     '<pre style="color:red; font-family: monospace">' + e.message + '</pre>';
//                   console.error('Preview render error:', e);
//                 }
//               </script>
//             </body>
//           </html>
//         `;

//         if (iframeRef.current) iframeRef.current.srcdoc = html;
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     runPreview();
//   }, [files]);

//   return (
//     <div className="w-full h-full flex flex-col rounded-lg border border-gray-700 overflow-hidden bg-white">
//       {error && (
//         <div className="bg-red-500/20 border-b border-red-500 p-3 text-red-300 text-sm font-mono max-h-20 overflow-auto">
//           ⚠️ {error}
//         </div>
//       )}
//       {loading && (
//         <div className="flex items-center justify-center h-full">
//           <p className="text-gray-600">Rendering preview...</p>
//         </div>
//       )}
//       <iframe
//         ref={iframeRef}
//         className="flex-1 w-full border-none"
//         title="Live Preview"
//         sandbox="allow-scripts allow-same-origin"
//         style={{ display: loading ? "none" : "block" }}
//       />
//     </div>
//   );
// }



// // import React from "react";
// // import { Sandpack } from "@codesandbox/sandpack-react";

// // export default function PreviewFrame({ files }) {
// //   if (!files || Object.keys(files).length === 0) {
// //     return <div className="p-4 text-gray-600">Waiting for generated files...</div>;
// //   }

// //   // Prepare Sandpack files
// //   const sandpackFiles = {};

// //   // Map generated files to Sandpack paths
// //   Object.entries(files).forEach(([path, content]) => {
// //     // Map main.css to index.css for Tailwind
// //     if (path.endsWith("main.css")) {
// //       sandpackFiles["/src/index.css"] = content;
// //     } else {
// //       // Ensure all other files start from root with proper /src or /
// //       sandpackFiles[`/${path}`] = content;
// //     }
// //   });

// //   // Inject a main.jsx for Sandpack rendering
// //   sandpackFiles["/src/main.jsx"] = `
// // import React from "react";
// // import { createRoot } from "react-dom/client";
// // import Main from "./components/Main";
// // import "./index.css";

// // // Mock siteData to replace fetch calls
// // const siteData = {
// //   site_title: "Blue Portfolio",
// //   pages: ["Home","About","Portfolio","Services","Contact"],
// //   sections: {
// //     Home: ["Hero","Features","Testimonials","CTA"],
// //     About: ["Mission","Team","Bio"],
// //     Portfolio: ["Gallery","ProjectDetails"],
// //     Services: ["ServiceList","Pricing"],
// //     Contact: ["ContactForm","Map"]
// //   }
// // };

// // const root = createRoot(document.getElementById("root"));
// // root.render(<Main siteData={siteData} />);
// // `;

// //   // Inject a basic index.html if not present
// //   if (!sandpackFiles["/index.html"]) {
// //     sandpackFiles["/index.html"] = `
// // <!DOCTYPE html>
// // <html lang="en">
// //   <head>
// //     <meta charset="UTF-8" />
// //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
// //     <title>Blue Portfolio Preview</title>
// //   </head>
// //   <body>
// //     <div id="root"></div>
// //   </body>
// // </html>
// //     `;
// //   }

// //   return (
// //     <div className="w-full h-full border border-gray-700 rounded-lg overflow-hidden">
// //       <Sandpack
// //         template="react18"
// //         files={sandpackFiles}
// //         options={{ autorun: true, showConsole: true, editorHeight: 300 }}
// //       />
// //     </div>
// //   );
// // }

// // import React, { useEffect, useRef, useState } from "react";

// // export default function PreviewFrame({ files }) {
// //   const iframeRef = useRef(null);
// //   const [error, setError] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     if (!files || Object.keys(files).length === 0) {
// //       setError("Waiting for generated files...");
// //       return;
// //     }

// //     setLoading(true);
// //     setError(null);

// //     try {
// //       const html = generateHTML(files);
// //       if (iframeRef.current) {
// //         iframeRef.current.srcdoc = html;
// //       }
// //       setLoading(false);
// //     } catch (err) {
// //       setError(err.message);
// //       setLoading(false);
// //     }
// //   }, [files]);

// //   return (
// //     <div className="w-full h-full flex flex-col rounded-lg border border-gray-700 overflow-hidden bg-white">
// //       {error && (
// //         <div className="bg-red-500/20 border-b border-red-500 p-3 text-red-300 text-sm font-mono max-h-20 overflow-auto">
// //           ⚠️ {error}
// //         </div>
// //       )}
// //       {loading && (
// //         <div className="flex items-center justify-center h-full">
// //           <p className="text-gray-600">Rendering preview...</p>
// //         </div>
// //       )}
// //       <iframe
// //         ref={iframeRef}
// //         className="flex-1 w-full border-none"
// //         title="Live Preview"
// //         sandbox="allow-scripts allow-same-origin"
// //         style={{ display: loading ? "none" : "block" }}
// //       />
// //     </div>
// //   );
// // }

// // function generateHTML(files) {
// //   // Get the HTML file (usually index.html)
// //   const htmlFile = files["index.html"];

// //   if (htmlFile) {
// //     // If we have index.html, use it directly
// //     return cleanCode(htmlFile);
// //   }

// //   // Otherwise, build HTML from components
// //   const appJsx = cleanCode(files["src/App.jsx"] || "");
// //   const mainCss = cleanCode(files["src/styles/main.css"] || "");
// //   const indexCss = cleanCode(files["src/index.css"] || "");

// //   // Extract just the JSX content from App.jsx
// //   const jsxContent = extractJSXContent(appJsx);

// //   return `
// //     <!DOCTYPE html>
// //     <html lang="en">
// //     <head>
// //       <meta charset="UTF-8">
// //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
// //       <title>Preview</title>
// //       <script src="https://cdn.tailwindcss.com"><\/script>
// //       <style>
// //         * { margin: 0; padding: 0; box-sizing: border-box; }
// //         body { 
// //           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
// //           background: #f9fafb;
// //         }
// //         #root { width: 100%; min-height: 100vh; }
// //         ${mainCss}
// //         ${indexCss}
// //       </style>
// //     </head>
// //     <body>
// //       <div id="root">
// //         <div style="padding: 40px; text-align: center; color: #666; font-family: monospace;">
// //           <h2>Preview</h2>
// //           <p>${jsxContent || "Loading..."}</p>
// //         </div>
// //       </div>
// //       <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
// //       <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
// //       <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
// //       <script type="text/babel">
// //         const root = ReactDOM.createRoot(document.getElementById('root'));
        
// //         try {
// //           // Mock component for preview
// //           const App = () => {
// //             return (
// //               <div className="p-8">
// //                 ${jsxContent || "<p>App component rendered</p>"}
// //               </div>
// //             );
// //           };
          
// //           root.render(<App />);
// //         } catch (e) {
// //           console.error('Error rendering:', e);
// //           document.getElementById('root').innerHTML = 
// //             '<div style="padding: 20px; color: red; font-family: monospace;">' +
// //             '<strong>Error:</strong><br/>' + e.message + '</div>';
// //         }
// //       </script>
// //     </body>
// //     </html>
// //   `;
// // }

// // function extractJSXContent(code) {
// //   if (!code) return "";

// //   // Try to extract return statement content
// //   const match = code.match(/return\s*\(([\s\S]*?)\);/);
// //   if (match && match[1]) {
// //     return match[1].trim().substring(0, 200); // First 200 chars
// //   }

// //   // Otherwise return first part of component
// //   return code.substring(0, 300).trim();
// // }

// // function cleanCode(code) {
// //   if (!code) return "";
// //   return code
// //     .replace(/^\`\`\`jsx\n?/i, "")
// //     .replace(/^\`\`\`js\n?/i, "")
// //     .replace(/^\`\`\`html?\n?/i, "")
// //     .replace(/^\`\`\`css\n?/i, "")
// //     .replace(/^\`\`\`\n?/i, "")
// //     .replace(/\n?\`\`\`$/i, "")
// //     .trim();
// // } 