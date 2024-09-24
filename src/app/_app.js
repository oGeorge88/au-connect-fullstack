// src/pages/_app.js
import React from 'react';
import './styles/globals.css'; // Keep this to import global CSS only

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
