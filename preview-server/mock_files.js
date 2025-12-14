// Make sure this file uses named export exactly as expected
export function generate_files(prompt) {
  return {
    "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - My Demo Website</title>
  </head>
  <body class="bg-gray-900 text-gray-100">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,

    "src/main.jsx": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`,

    "src/App.jsx": `import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          Hello React + Tailwind Preview!
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          This is a live preview of your website project built with Vite, React, and Tailwind CSS.
        </p>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ React 18</li>
            <li>✅ Tailwind CSS 3</li>
            <li>✅ Vite Build System</li>
            <li>✅ Hot Module Replacement</li>
          </ul>
        </div>
        <button className="mt-8 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105">
          Click me!
        </button>
      </div>
    </div>
  );
}
`,

    "src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  padding: 0;
}
`,

    "vite.config.js": `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  }
});
`,

    "postcss.config.js": `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

    "tailwind.config.js": `export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,

    "package.json": `{
  "name": "preview-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
`
  };
}