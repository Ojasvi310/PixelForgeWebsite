import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      "monaco-editor",
      "monaco-editor/esm/vs/language/css/css.worker",
      "monaco-editor/esm/vs/language/html/html.worker",
      "monaco-editor/esm/vs/language/json/json.worker",
      "monaco-editor/esm/vs/language/typescript/ts.worker",
    ],
  },
});
