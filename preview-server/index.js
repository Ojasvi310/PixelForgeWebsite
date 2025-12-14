import express from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import { randomUUID } from "crypto";
import { execa } from "execa";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const PREVIEWS_DIR = path.join(process.cwd(), "previews");
await fs.ensureDir(PREVIEWS_DIR);

// ✅ Serve static files from preview dist folders
app.use("/preview/:id", (req, res, next) => {
  const projectId = req.params.id;
  const projectDist = path.join(PREVIEWS_DIR, projectId, "dist");

  console.log("📂 Serving from:", projectDist);
  console.log("📄 Request path:", req.path);

  if (!fs.existsSync(projectDist)) {
    console.error("❌ Dist folder not found:", projectDist);
    return res.status(404).send("Preview not found");
  }

  const staticMiddleware = express.static(projectDist, {
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      }
    }
  });

  staticMiddleware(req, res, next);
});

// ✅ NEW: API to generate preview from files (from backend)
app.post("/api/preview-from-files", async (req, res) => {
  const { files } = req.body;

  if (!files || typeof files !== 'object') {
    console.error("❌ Invalid request: files is not an object");
    return res.status(400).json({ error: "Invalid files object" });
  }

  const fileCount = Object.keys(files).length;
  if (fileCount === 0) {
    console.error("❌ Invalid request: no files provided");
    return res.status(400).json({ error: "No files provided" });
  }

  const id = randomUUID();
  const projectDir = path.join(PREVIEWS_DIR, id);

  console.log("\n🆔 Preview ID:", id);
  console.log("📂 Project dir:", projectDir);
  console.log("📝 Received", fileCount, "files:", Object.keys(files).join(", "));
  
  // Log file sizes
  for (const [fileName, content] of Object.entries(files)) {
    console.log(`  - ${fileName}: ${content?.length || 0} bytes`);
  }

  try {
    await fs.ensureDir(projectDir);

    // 1️⃣ Write files to disk
    console.log("\n💾 Writing files...");
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(projectDir, filePath);
      console.log(`  Writing: ${filePath} (${content?.length || 0} bytes)`);
      
      // Ensure directory exists
      await fs.ensureDir(path.dirname(fullPath));
      
      // Write file with explicit UTF-8 encoding
      await fs.writeFile(fullPath, content, { encoding: "utf8" });
      
      // Verify file was written
      if (await fs.pathExists(fullPath)) {
        const stats = await fs.stat(fullPath);
        console.log(`  ✓ ${filePath} (${stats.size} bytes written)`);
      } else {
        console.error(`  ❌ Failed to write ${filePath}`);
        throw new Error(`File not written: ${filePath}`);
      }
    }
    
    // Verify all files exist
    console.log("\n🔍 Verifying files...");
    const allFiles = await fs.readdir(projectDir, { recursive: true });
    console.log("Files in project:", allFiles);

    // 2️⃣ Install dependencies
    console.log("\n📦 Installing dependencies...");
    await execa("npm", ["install"], { 
      cwd: projectDir, 
      stdio: "inherit",
      timeout: 120000 // 2 minute timeout
    });

    // 3️⃣ Build with Vite
    console.log("\n🔨 Building with Vite...");
    await execa("npx", ["vite", "build"], { 
      cwd: projectDir, 
      stdio: "inherit",
      timeout: 120000
    });

    // 4️⃣ Verify dist folder
    const distPath = path.join(projectDir, "dist");
    if (!fs.existsSync(distPath)) {
      throw new Error("Build did not create dist folder");
    }

    const distFiles = fs.readdirSync(distPath);
    console.log("📁 Built files:", distFiles.join(", "));

    const previewUrl = `http://localhost:3001/preview/${id}/`;
    console.log("✅ Preview ready:", previewUrl);

    res.json({ previewUrl });

  } catch (err) {
    console.error("\n❌ Preview failed:", err.message);
    console.error("Stack:", err.stack);
    
    // Clean up failed build
    try {
      await fs.remove(projectDir);
    } catch (cleanupErr) {
      console.error("Failed to cleanup:", cleanupErr);
    }

    res.status(500).json({ 
      error: "Preview failed", 
      details: err.message 
    });
  }
});

// Test endpoint to verify file writing works
app.post("/api/test-write", async (req, res) => {
  const testId = "test-" + Date.now();
  const testDir = path.join(PREVIEWS_DIR, testId);
  
  try {
    console.log("Testing file write to:", testDir);
    
    await fs.ensureDir(testDir);
    await fs.writeFile(path.join(testDir, "test.txt"), "Hello World", "utf8");
    
    const exists = await fs.pathExists(path.join(testDir, "test.txt"));
    const content = await fs.readFile(path.join(testDir, "test.txt"), "utf8");
    
    res.json({ 
      success: true, 
      testDir,
      exists,
      content 
    });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Preview server running",
    previewsDir: PREVIEWS_DIR
  });
});

// List previews
app.get("/api/previews", async (req, res) => {
  try {
    const previews = await fs.readdir(PREVIEWS_DIR);
    res.json({ previews });
  } catch (e) {
    res.json({ previews: [] });
  }
});

// Clean old previews (optional utility endpoint)
app.post("/api/clean", async (req, res) => {
  try {
    const previews = await fs.readdir(PREVIEWS_DIR);
    let cleaned = 0;
    
    for (const preview of previews) {
      const previewPath = path.join(PREVIEWS_DIR, preview);
      const stats = await fs.stat(previewPath);
      const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
      
      // Remove previews older than 24 hours
      if (ageHours > 24) {
        await fs.remove(previewPath);
        cleaned++;
      }
    }
    
    res.json({ cleaned, remaining: previews.length - cleaned });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("🚀 Preview server running on http://localhost:" + PORT);
  console.log("📂 Previews directory:", PREVIEWS_DIR);
});

// Add these endpoints to your preview server (after the existing /api/previews endpoint)

// ✅ NEW: View generated files for a preview
app.get("/api/preview/:id/files", async (req, res) => {
  const { id } = req.params;
  const projectDir = path.join(PREVIEWS_DIR, id);

  if (!fs.existsSync(projectDir)) {
    return res.status(404).json({ error: "Preview not found" });
  }

  try {
    const files = {};
    const allFiles = await fs.readdir(projectDir, { recursive: true });

    for (const file of allFiles) {
      // Skip node_modules and dist to keep response manageable
      if (file.includes("node_modules") || file.includes("dist")) continue;

      const filePath = path.join(projectDir, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const content = await fs.readFile(filePath, "utf8").catch(() => "[Binary file]");
        files[file] = {
          size: stats.size,
          content: content.substring(0, 2000), // First 2000 chars to avoid huge responses
          truncated: content.length > 2000
        };
      }
    }

    res.json({ 
      projectDir,
      files,
      fileCount: Object.keys(files).length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ NEW: View a specific file's full content
app.get("/api/preview/:id/file", async (req, res) => {
  const { id } = req.params;
  const { path: filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: "Missing path query parameter" });
  }

  const fullPath = path.join(PREVIEWS_DIR, id, filePath);
  
  // Security: prevent path traversal
  const normalizedPath = path.normalize(fullPath);
  const projectDir = path.join(PREVIEWS_DIR, id);
  
  if (!normalizedPath.startsWith(projectDir)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const content = await fs.readFile(fullPath, "utf8");
    res.json({ 
      file: filePath,
      size: content.length,
      content
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ NEW: View dist folder contents
app.get("/api/preview/:id/dist", async (req, res) => {
  const { id } = req.params;
  const distDir = path.join(PREVIEWS_DIR, id, "dist");

  if (!fs.existsSync(distDir)) {
    return res.status(404).json({ error: "Dist folder not found" });
  }

  try {
    const files = {};
    const allFiles = await fs.readdir(distDir, { recursive: true });

    for (const file of allFiles) {
      const filePath = path.join(distDir, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const isBinary = [".js", ".css", ".woff", ".woff2", ".ttf"].some(ext => file.endsWith(ext));
        
        let content;
        if (isBinary && file.endsWith(".js")) {
          content = await fs.readFile(filePath, "utf8").substring(0, 1000);
        } else if (!isBinary) {
          content = await fs.readFile(filePath, "utf8");
        } else {
          content = "[Binary file]";
        }

        files[file] = {
          size: stats.size,
          content: content.substring(0, 1500),
          truncated: content.length > 1500
        };
      }
    }

    res.json({ 
      distDir,
      files,
      fileCount: Object.keys(files).length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ NEW: Simple HTML viewer for dist files
app.get("/api/preview/:id/view", async (req, res) => {
  const { id } = req.params;
  const distDir = path.join(PREVIEWS_DIR, id, "dist");

  if (!fs.existsSync(distDir)) {
    return res.status(404).send("Dist folder not found");
  }

  try {
    const files = await fs.readdir(distDir, { recursive: true });
    const srcFiles = files.filter(f => !f.includes("node_modules"));

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preview: ${id}</title>
        <style>
          body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #ccc; }
          h1 { color: #0f0; }
          .file { margin: 10px 0; padding: 10px; background: #222; border-left: 3px solid #0f0; }
          .file-name { font-weight: bold; color: #0f0; }
          .file-size { color: #666; font-size: 0.9em; }
          pre { background: #111; padding: 10px; overflow-x: auto; }
          a { color: #0ff; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Preview Files: ${id}</h1>
        <p><a href="/api/preview/${id}/files">View JSON</a></p>
        <div>
          ${srcFiles.map(f => `<div class="file"><div class="file-name">${f}</div></div>`).join("")}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});