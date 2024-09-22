// src/app/components/Navbar.js
"use client";
import { useAuth } from '../AuthContext'; // Corrected import path
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Navbar = () => {
  const { isLoggedIn, logout, loading } = useAuth(); // Access loading state from AuthContext
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout(); // Call the logout function
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <nav className="bg-red-600 shadow-lg">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-white text-xl font-bold">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-red-600 shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          <Link href="/">AU Connect</Link>
        </div>
        <ul className="flex space-x-4 text-white">
          <li>
            <Link href="/">Announcement</Link>
          </li>
          {isLoggedIn ? (
            <>
              <li>
                <Link href="/profile">Profile</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="hover:text-blue-300">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/signup">Sign Up</Link>
              </li>
              <li>
                <Link href="/login">Log In</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
