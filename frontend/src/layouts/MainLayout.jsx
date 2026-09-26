import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LegalLensAgent from '../components/LegalLensAgent';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf2] text-black selection:bg-neo-yellow selection:text-black relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Omnipresent LegalLens Copilot Agent active in every section */}
      <LegalLensAgent />
    </div>
  );
}
