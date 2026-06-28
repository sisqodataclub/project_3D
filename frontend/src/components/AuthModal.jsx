import React, { useState } from 'react';
import { useHVT } from '../context/HVTContext';

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useHVT();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        onClose(); // Close modal on success
      } else {
        if (password !== password2) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(email, password, password2);
        // After registration, switch to login tab (or auto-login)
        setActiveTab('login');
        setPassword('');
        setPassword2('');
        setError('Registration successful! Please login.');
        // Optionally, you could auto-login here, but it's better to let user login manually.
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">CV Manager Auth</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-4">
          <button
            className={`flex-1 py-2 text-center font-semibold transition ${activeTab === 'login' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-center font-semibold transition ${activeTab === 'register' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {activeTab === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-lg font-semibold transition"
          >
            {loading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-gray-400 text-xs mt-4 text-center">
          {activeTab === 'login'
            ? "Don't have an account? Click 'Register' above."
            : "Already have an account? Click 'Login' above."}
        </p>
      </div>
    </div>
  );
}
