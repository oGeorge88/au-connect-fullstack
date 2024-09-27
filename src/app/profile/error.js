'use client'; // Error components must be Client components

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Error boundary caught an error:', error);
    // Optionally log the error to an error tracking service
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 p-5">
          <div className="bg-white rounded shadow-md p-6">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong!</h1>
            <p className="mt-2 text-red-500">{error.message}</p>
            <button 
              onClick={() => reset()} 
              className="mt-4 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
            <p className="mt-4">
              <a href="/" className="text-blue-600 hover:underline">Go back to homepage</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
