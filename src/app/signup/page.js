"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SignupPage = () => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faculty, setFaculty] = useState('');
  const [gender, setGender] = useState('male'); // Default to 'male' to avoid having no selection
  const [studentId, setStudentId] = useState(''); // Optional field
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state
  const router = useRouter();

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true); // Start loading when form is submitted

    try {
      // Send signup request to the backend
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          username,
          email,
          password,
          faculty,
          gender,
          studentId: studentId || null, // Optional field
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show alert message for successful signup
        window.alert('Signup successful! Please log in.');
        // Redirect to the login page after successful signup
        router.push('/login');
      } else {
        // Display error message from the response
        setError(data.message || 'Signup failed. Please check your input.');
      }
    } catch (error) {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false); // Stop loading after request
    }
  };

  return (
    <div className="container mx-auto px-4">
      <form onSubmit={handleSignup} className="max-w-sm mx-auto bg-white p-6 rounded shadow-md mt-10">
        <h2 className="text-center text-2xl font-bold mb-4">Sign Up</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Display Name */}
        <div className="mb-4">
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Password */}
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

        {/* Faculty */}
        <div className="mb-4">
          <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">Faculty</label>
          <input
            type="text"
            id="faculty"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={(e) => setGender(e.target.value)}
                className="form-radio text-indigo-600"
              />
              <span className="ml-2">Male</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={(e) => setGender(e.target.value)}
                className="form-radio text-indigo-600"
              />
              <span className="ml-2">Female</span>
            </label>
          </div>
        </div>

        {/* Student ID (Optional) */}
        <div className="mb-4">
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID (Optional)</label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
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
              Signing Up...
            </>
          ) : (
            'Sign Up'
          )}
        </button>

        {/* Link to Login page */}
        <p className="mt-4 text-center">
          Already registered?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
