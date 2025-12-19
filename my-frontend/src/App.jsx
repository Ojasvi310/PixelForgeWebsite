import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";

const BACKEND_URL = "http://localhost:8000";
const PREVIEW_URL = "http://localhost:3001";

async function generateWebsite(prompt) {
  const res = await fetch(`${BACKEND_URL}/generate`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Generation failed");
  }

  return res.json();
}

async function createPreview(files) {
  const res = await fetch(`${PREVIEW_URL}/api/preview-from-files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Preview creation failed");
  }

  return res.json();
}

export default function App() {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [stage, setStage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  async function handleGenerate() {
    // Check if user is logged in
    if (!user) {
      setError("Please sign in to generate websites");
      openAuthModal('login');
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedData(null);
    setPreviewUrl(null);
    setPreviewError(null);
    setShowDebug(false);

    try {
      // Step 1: Generate code from backend
      setStage("Generating website code...");
      const data = await generateWebsite(prompt.trim());
      setGeneratedData(data);

      console.log("✅ Generated data:", data);
      console.log("✅ Files received:", Object.keys(data.files || {}));

      // Step 2: Create preview
      setStage("Building preview...");
      console.log("📤 Sending files to preview server...");

      try {
        const preview = await createPreview(data.files);
        setPreviewUrl(preview.previewUrl);
        console.log("✅ Preview ready:", preview.previewUrl);
        setStage("");
      } catch (previewErr) {
        console.error("⚠️ Preview build failed:", previewErr.message);
        setPreviewError(previewErr.message);
        setShowDebug(true);
        setStage("");
      }
    } catch (e) {
      console.error("❌ Error:", e);
      setError(e.message);
      setStage("");
    } finally {
      setLoading(false);
    }
  }

  const files = generatedData?.files || {};
  const fileList = Object.keys(files);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 text-gray-100 flex flex-col">
      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* HEADER */}
      <header className="bg-gray-900/80 shadow-lg py-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              PixelForge
            </h1>
            <p className="text-gray-400 mt-1">AI Website Generator</p>
          </div>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Welcome,</p>
                  <p className="font-semibold text-cyan-400">{user.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg transition font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL - INPUT & CODE */}
        <section className="w-1/2 p-6 overflow-y-auto border-r border-gray-700">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
              Describe Your Website
            </h2>

            {!user && (
              <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Please sign in to use the website generator
                </p>
              </div>
            )}

            <textarea
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
              placeholder="Example: Create a modern landing page for a coffee shop with a hero section, menu showcase, and contact form. Use warm brown tones and a cozy aesthetic."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              disabled={loading || !user}
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || !user}
              className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Generating..." : "Generate Website"}
            </button>

            {/* LOADING STAGE */}
            {loading && stage && (
              <div className="mt-6 p-4 rounded-lg bg-blue-900/30 border border-blue-600">
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  <p className="text-blue-200">{stage}</p>
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-6 p-4 rounded-lg bg-red-900/30 border border-red-600">
                <p className="font-semibold text-red-200">Error:</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* PREVIEW BUILD ERROR */}
            {previewError && (
              <div className="mt-6 p-4 rounded-lg bg-yellow-900/30 border border-yellow-600">
                <p className="font-semibold text-yellow-200">
                  ⚠️ Preview Build Failed:
                </p>
                <p className="text-yellow-300 text-sm mt-1">{previewError}</p>
                <p className="text-yellow-200 text-xs mt-2">
                  Check the debug panel below to inspect generated files
                </p>
              </div>
            )}

            {/* GENERATED FILES INFO */}
            {generatedData && (
              <div className="mt-6 p-4 rounded-lg bg-green-900/30 border border-green-600">
                <h3 className="font-semibold text-green-200 mb-2">
                  ✅ Generation Complete
                </h3>
                <div className="text-sm text-green-300 space-y-1">
                  <p>
                    <strong>Site:</strong>{" "}
                    {generatedData.plan?.site_title || "Untitled"}
                  </p>
                  <p>
                    <strong>Style:</strong>{" "}
                    {generatedData.design?.style || "modern"}
                  </p>
                  <p>
                    <strong>Files:</strong> {fileList.length}
                  </p>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-green-200 hover:text-green-100">
                    View generated files
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs text-gray-300 ml-4">
                    {fileList.map((file) => (
                      <li
                        key={file}
                        className="cursor-pointer hover:text-cyan-300 hover:underline"
                        onClick={() => {
                          setSelectedFile(file);
                          setShowDebug(true);
                        }}
                      >
                        📄 {file} ({files[file]?.length || 0} bytes)
                      </li>
                    ))}
                  </ul>
                </details>

                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="mt-3 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-xs font-medium"
                >
                  {showDebug ? "Hide" : "Show"} File Inspector
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL - LIVE PREVIEW OR DEBUG */}
        <section className="w-1/2 p-6 overflow-hidden flex flex-col">
          {showDebug && generatedData ? (
            <div className="flex flex-col h-full">
              <h3 className="text-2xl font-semibold mb-4">📋 File Inspector</h3>

              <div className="mb-4 pb-4 border-b border-gray-700 overflow-y-auto max-h-32">
                <div className="flex flex-wrap gap-2">
                  {fileList.map((file) => (
                    <button
                      key={file}
                      onClick={() => setSelectedFile(file)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        selectedFile === file
                          ? "bg-cyan-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      }`}
                    >
                      {file.split("/").pop()}
                    </button>
                  ))}
                </div>
              </div>

              {selectedFile && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="mb-2">
                    <p className="text-sm text-gray-400">
                      <strong>File:</strong> {selectedFile}
                    </p>
                    <p className="text-xs text-gray-500">
                      Size: {files[selectedFile]?.length || 0} bytes
                    </p>
                  </div>

                  <pre className="flex-1 bg-gray-800 p-4 rounded border border-gray-700 overflow-auto text-xs text-gray-300 font-mono">
                    {files[selectedFile]
                      ? files[selectedFile].substring(0, 5000)
                      : "File not found"}
                    {files[selectedFile]?.length > 5000 && (
                      <div className="text-yellow-400 mt-4">
                        ... ({files[selectedFile].length - 5000} more
                        characters)
                      </div>
                    )}
                  </pre>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(files[selectedFile] || "");
                      alert("Copied to clipboard!");
                    }}
                    className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-semibold mb-4">Live Preview</h3>

              {previewUrl ? (
                <div className="flex-1 relative">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-2 border-gray-700 rounded-lg bg-white shadow-2xl"
                    title="Website Preview"
                  />
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium shadow-lg"
                  >
                    Open in New Tab ↗
                  </a>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-xl text-gray-400">
                      {loading
                        ? "Generating preview..."
                        : user
                        ? "Preview will appear here"
                        : "Sign in to start generating"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {user
                        ? "Describe your website and click Generate"
                        : "Create an account to use PixelForge"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-4 bg-gray-900/80 text-center text-gray-400 border-t border-gray-700">
        <p>© 2025 PixelForge — Powered by AI</p>
      </footer>
    </div>
  );
}