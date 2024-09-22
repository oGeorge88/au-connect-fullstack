'use client'; // Error components must be Client components

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Error boundary caught an error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '20px', background: '#f8d7da', color: '#721c24' }}>
          <h1>Something went wrong!</h1>
          <p>{error.message}</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
