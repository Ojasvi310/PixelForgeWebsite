// src/AuthGate.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthPage from "./AuthPage";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={() => setUser(true)} />;
  }

  return (
    <>
      {/* LOGOUT BUTTON */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => signOut(auth)}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          Logout
        </button>
      </div>

      {children}
    </>
  );
}
