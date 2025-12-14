import fs from "fs-extra";
import path from "path";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { execSync } from "child_process";

const TMP_DIR = path.join(process.cwd(), ".vercel-previews");

export async function createPreview(req, res) {
  const { files } = req.body;

  if (!files || typeof files !== "object") {
    return res.status(400).json({ error: "Invalid files" });
  }

  const previewId = uuid();
  const projectDir = path.join(TMP_DIR, previewId);

  try {
    // 1️⃣ Create temp project
    await fs.ensureDir(projectDir);

    // 2️⃣ Write files
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(projectDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);
    }

    // 3️⃣ Ensure minimum package.json
    const pkgPath = path.join(projectDir, "package.json");
    if (!(await fs.pathExists(pkgPath))) {
      await fs.writeJson(pkgPath, {
        name: "ai-preview",
        private: true,
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          vite: "^5.0.0",
          tailwindcss: "^3.4.0",
          autoprefixer: "^10.4.0",
          postcss: "^8.4.0"
        }
      });
    }

    // 4️⃣ Deploy using Vercel CLI
    const url = execSync(
      `vercel deploy --yes --token=${process.env.VERCEL_TOKEN}`,
      {
        cwd: projectDir,
        encoding: "utf-8",
      }
    );

    return res.json({
      previewUrl: url.trim(),
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Preview failed" });
  }
}
