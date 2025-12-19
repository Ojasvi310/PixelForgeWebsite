from model_adapters import call_llm
import json
import re
from agents.planner import plan_from_prompt
from agents.designer import generate_theme


# ------------------------------------------------------------------
# SANITIZATION HELPERS
# ------------------------------------------------------------------

def strip_all_markdown(text: str) -> str:
    """Aggressively remove ALL markdown formatting and artifacts."""
    if not text:
        return text
    
    original = text
    text = text.strip()
    
    # Remove code fences (all variations)
    text = re.sub(r'```[a-z]*\n?', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```', '', text)
    text = re.sub(r'`', '', text)
    
    # Remove JSON array/object wrapping if present
    if text.startswith('{') or text.startswith('['):
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                # If it's a dict with string values, join them
                if all(isinstance(v, str) for v in parsed.values()):
                    text = '\n'.join(parsed.values())
            elif isinstance(parsed, list):
                # If it's a list of strings, join them
                if all(isinstance(item, str) for item in parsed):
                    text = '\n'.join(parsed)
        except:
            pass
    
    # Remove comment lines (// style)
    lines = text.split('\n')
    lines = [l for l in lines if not l.strip().startswith('//') or 'import' in l or 'export' in l]
    text = '\n'.join(lines)
    
    # Remove empty lines at start/end
    text = text.strip()
    
    # If we accidentally removed everything, return original
    if not text or len(text) < 10:
        return original.strip()
    
    return text


# ------------------------------------------------------------------
# HARDCODED STATIC FILES (100% COMPATIBLE)
# ------------------------------------------------------------------

STATIC_FILES = {
    "vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
})
""",

    "postcss.config.cjs": """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""",

    "tailwind.config.js": """export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
""",

    "package.json": """{
  "name": "preview-project",
  "private": true,
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
""",

    "src/main.jsx": """import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

const container = document.getElementById("root")
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
""",

    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
"""
}


# ------------------------------------------------------------------
# MAIN GENERATOR
# ------------------------------------------------------------------

def generate_files(prompt: str, structure: dict = None, design: dict = None) -> dict:
    print("=" * 70)
    print("CODE GENERATION PIPELINE")
    print("=" * 70)
    print()

    # 1. PLAN
    try:
        plan = plan_from_prompt(prompt)
        print(f"✓ Plan: {plan.get('site_title', 'Untitled')}")
    except Exception as e:
        print(f"Plan failed: {e}")
        plan = {"site_title": "My Website", "pages": ["Home"]}

    site_title = plan.get("site_title", "My Website")

    # 2. DESIGN
    if not design:
        try:
            design = generate_theme(prompt, plan)
            print(f"✓ Design: {design.get('style', 'modern')}")
        except Exception as e:
            print(f" Design failed: {e}")
            design = {}

    style = design.get("style", "modern")
    primary = design.get("palette", {}).get("primary", "#3b82f6")

    # 3. START WITH STATIC FILES (PROTECTED - NEVER OVERWRITE)
    files = {}
    for key, value in STATIC_FILES.items():
        files[key] = value
    
    print(f"\nAdded {len(STATIC_FILES)} protected static files")
    print("  Protected files:", ", ".join(STATIC_FILES.keys()))

    # 4. GENERATE index.html
    files["index.html"] = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{site_title}</title>
  </head>
  <body class="bg-gray-900 text-gray-100">
    <div id="root"></div>
    <script type="module" src="./src/main.jsx"></script>
  </body>
</html>
"""
    print("✓ Generated index.html")

    # 5. GENERATE App.jsx (JSX BODY ONLY)
    print("\nGenerating App.jsx...")
    
    jsx_prompt = f"""Generate ONLY the JSX body for a React component.

PROJECT: {prompt}
TITLE: {site_title}
PAGES: {", ".join(plan.get("pages", ["Home"]))}
STYLE: {style}
PRIMARY COLOR: {primary}

CRITICAL RULES:
- Output ONLY JSX markup (the content inside return statement)
- Start with <div> and end with </div>
- Use Tailwind CSS classes ONLY
- NO imports, NO exports, NO function declaration
- NO markdown formatting (no ```)
- NO JSON formatting
- NO comments

Example output:
<div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
  <h1 className="text-4xl">Title</h1>
</div>

Now generate for this project:"""

    try:
        jsx_body = call_llm(jsx_prompt, agent="codegen")
        
        # AGGRESSIVE SANITIZATION
        jsx_body = strip_all_markdown(jsx_body)
        
        # Ensure it starts with <
        if not jsx_body.strip().startswith("<"):
            print("Invalid JSX, using fallback")
            raise ValueError("Invalid JSX body")
        
        print(f"✓ Generated JSX body ({len(jsx_body)} chars)")

    except Exception as e:
        print(f"JSX generation failed: {e}, using fallback")
        jsx_body = f"""<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
  <div className="text-center text-white">
    <h1 className="text-5xl font-bold mb-4">{site_title}</h1>
    <p className="text-xl text-gray-200">Welcome to your website</p>
  </div>
</div>"""

    # Wrap JSX in proper React component
    files["src/App.jsx"] = f"""import React from "react"

export default function App() {{
  return (
    {jsx_body}
  )
}}
"""
    
    print("✓ Created App.jsx")

    # 6. SUMMARY + FINAL SANITIZATION
    print("\n" + "=" * 70)
    print("GENERATION COMPLETE")
    print("=" * 70)
    print(f"Total files: {len(files)}")
    print("Files:", ", ".join(files.keys()))
    
    # PROTECT STATIC FILES: Restore them if they were modified
    print("\nProtecting static files...")
    for static_file in STATIC_FILES.keys():
        if files.get(static_file) != STATIC_FILES[static_file]:
            print(f"{static_file} was modified! Restoring original...")
            files[static_file] = STATIC_FILES[static_file]
    
    # FINAL PASS: Strip markdown ONLY from generated files
    print("\n🧹 Sanitizing generated files...")
    generated_files = ['index.html', 'src/App.jsx']
    for filename in generated_files:
        if filename in files and filename.endswith(('.jsx', '.js', '.html')):
            original_len = len(files[filename])
            files[filename] = strip_all_markdown(files[filename])
            new_len = len(files[filename])
            if original_len != new_len:
                print(f"  ✓ Cleaned {filename} ({original_len} → {new_len} bytes)")
    
    # DEBUG: Print App.jsx to verify
    print("\n🔍 App.jsx preview (first 400 chars):")
    print(files["src/App.jsx"][:400])
    print()

    return files