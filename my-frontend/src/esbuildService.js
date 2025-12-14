import * as esbuild from "esbuild-wasm";

let serviceInitialized = false;

export async function initEsbuild() {
  if (!serviceInitialized) {
    await esbuild.initialize({
      wasmURL: "/esbuild.wasm",
      worker: true,
    });
    serviceInitialized = true;
  }
}

export async function bundleFiles(files) {
  await initEsbuild();

  // Combine all JS/JSX into a single string
  const allCode = Object.entries(files)
    .filter(([path]) => path.endsWith(".js") || path.endsWith(".jsx"))
    .map(([path, content]) => `// File: ${path}\n${content}`)
    .join("\n");

  // Bundle via stdin
  const result = await esbuild.build({
    entryPoints: ["index.js"], // dummy entry
    bundle: true,
    write: false,
    stdin: {
      contents: allCode,
      resolveDir: "/",
      sourcefile: "index.js",
      loader: "jsx",
    },
  });

  return result.outputFiles[0].text;
}
