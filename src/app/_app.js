// src/pages/_app.js
import React from 'react';
import './styles/globals.css'; // Keep this to import global CSS only
import Layout from '../components/Layout'; // Example layout component
import { AuthProvider } from '../context/AuthContext'; // Example auth context provider

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
