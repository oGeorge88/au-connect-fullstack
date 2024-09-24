// lib/auth.js

import { serialize } from 'cookie';

// Function to set the session cookie
export function setLoginSession(res, { userId, role }) {
  // Create a session object with user details
  const session = JSON.stringify({ userId, role });

  // Set cookie options, including httpOnly for security and maxAge for expiration
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax',
  };

  // Serialize the cookie and set it in the response header
  const cookie = serialize('session', session, cookieOptions);

  res.setHeader('Set-Cookie', cookie);
}

// Function to clear the session cookie (for logging out)
export function clearLoginSession(res) {
  const cookie = serialize('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, // Immediately expire the cookie
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}
