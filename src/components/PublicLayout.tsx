'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * PublicLayout wraps all public-facing pages (Home, Course List, Detail, Cart, etc.)
 * it provides a consistent Navbar and Footer.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* 
         pt-36 ensures content starts below the fixed Navbar.
         flex-1 ensures the content area grows to push the Footer down.
      */}
      <main className="flex-1 pt-36">
        {children}
      </main>

      <Footer />
    </div>
  );
}
