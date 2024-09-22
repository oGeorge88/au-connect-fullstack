// src/app/layout.js
import { AuthProvider } from "./AuthContext"; // Import AuthProvider
import Navbar from "./components/Navbar"; // Import Navbar
import Footer from "./components/Footer"; // Import Footer
import "./globals.css"; // Import global styles

export const metadata = {
  title: "AU Connect",
  favicon: "/favicon.ico",
  description: "Au Connect is a social media platform for students of AU",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 min-h-screen">
        <AuthProvider>
          {" "}
          {/* Wrap the whole app with AuthProvider */}
          <Navbar /> {/* Navbar visible on all pages */}
          <main className="flex-grow container mx-auto px-4 py-8">
            {children} {/* Dynamic content for each page */}
          </main>
          <Footer /> {/* Footer visible on all pages */}
        </AuthProvider>
      </body>
    </html>
  );
}
