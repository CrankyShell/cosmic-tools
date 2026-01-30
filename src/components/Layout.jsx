import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder for your background image
// Make sure to put 'background.jpg' inside the public/ folder later!
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 1. The Fixed Background */}
      <div className="cosmic-background">
        {/* We use /background.jpg assuming the file is in the public folder */}
        <img src="/background.jpg" alt="Space Chart" className="cosmic-bg-image" />
        {/* CSS Star overlay effect could be added here later */}
      </div>

      {/* 2. Navigation Bar (Simple version for now) */}
      <nav className="p-6 flex justify-between items-center backdrop-blur-sm bg-black/20 sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
            {/* Logo placeholder */}
            <img src="/logo.png" alt="Cosmic Logo" className="h-10 w-10 object-contain"/>
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            COSMIC TOOLS
            </Link>
        </div>
        <div className="flex gap-6 text-sm font-semibold tracking-wider">
          <Link to="/" className="hover:text-purple-400 transition">HOME</Link>
          <Link to="/about" className="hover:text-purple-400 transition">ABOUT</Link>
          <Link to="/contact" className="hover:text-purple-400 transition">CONTACT</Link>
        </div>
      </nav>

      {/* 3. Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8 z-10">
        {children}
      </main>

      {/* 4. The Watermark Footer */}
      <footer className="w-full text-center py-4 text-xs text-gray-500 bg-black/80 backdrop-blur border-t border-white/5 z-50">
        <p>© 2026 Cosmic Tools v3.0 | Created with love by PaulFX</p>
      </footer>
    </div>
  );
};

export default Layout;