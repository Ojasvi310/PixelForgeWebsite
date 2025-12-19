import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  if (!isOpen) return null;
     const handleSubmit = async (e) => {
        e.preventDefault();      // ← THIS IS CRITICAL
        e.stopPropagation();     // ← extra safety

        setError('');
        setLoading(true);

        let result;
        if (mode === 'login') {
            result = await login(email, password);
        } else {
            if (!name.trim()) {
            setError('Name is required');
            setLoading(false);
            return;
            }
            result = await signup(email, password, name);
        }

        setLoading(false);

        if (result.success) {
            onClose();
            setEmail('');
            setPassword('');
            setName('');
        } else {
            setError(result.error);
        }
        };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     let result;
//     if (mode === 'login') {
//       result = await login(email, password);
//     } else {
//       if (!name.trim()) {
//         setError('Name is required');
//         setLoading(false);
//         return;
//       }
//       result = await signup(email, password, name);
//     }

//     setLoading(false);

//     if (result.success) {
//       onClose();
//       // Reset form
//       setEmail('');
//       setPassword('');
//       setName('');
//     } else {
//       setError(result.error);
//     }
//   };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white"
                placeholder="Your name"
                required={mode === 'signup'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Switch mode */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={switchMode}
            className="ml-2 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}