"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import Link from 'next/link';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({ role: data.role, userId: data.userId });
        window.alert(`Login successful! Welcome ${data.role === 'admin' ? 'Admin' : 'User'}.`);

        if (data.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An error occurred while trying to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <form onSubmit={handleLogin} className="max-w-sm mx-auto bg-white p-6 rounded shadow-md mt-10">
        <h2 className="text-center text-2xl font-bold mb-4">Log In</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-4">
          <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">Username or Email</label>
          <input
            type="text"
            id="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 flex justify-center items-center"
          disabled={loading}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          )}
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
