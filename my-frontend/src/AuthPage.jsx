import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

export default function AuthPage({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuth?.(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-900 to-indigo-950">
      {/* Floating background blobs */}
      <div className="absolute inset-0">
        <div className="blob blob-indigo"></div>
        <div className="blob blob-purple"></div>
        <div className="blob blob-pink"></div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_0_60px_rgba(99,102,241,0.25)] p-8 space-y-6">
          {/* Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              PixelForge
            </h1>
            <p className="text-sm text-slate-400">AI Website Generator</p>
          </div>

          {/* Auth title */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-200">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isLogin
                ? "Sign in to continue building"
                : "Generate websites with AI in seconds"}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                isLogin
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                !isLogin
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-pink-300 bg-pink-900/20 border border-pink-500/30 p-2 rounded">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>

          <p className="text-xs text-center text-slate-500">
            Secure authentication powered by Firebase
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .blob {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.45;
          animation: float 18s ease-in-out infinite;
        }

        .blob-indigo {
          background: #6366f1;
          top: 10%;
          left: 15%;
        }

        .blob-purple {
          background: #8b5cf6;
          top: 60%;
          left: 55%;
          animation-delay: 4s;
        }

        .blob-pink {
          background: #ec4899;
          top: 30%;
          left: 70%;
          animation-delay: 8s;
        }

        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-40px) translateX(30px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
    </div>
  );
}
