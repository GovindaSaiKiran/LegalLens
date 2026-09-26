import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/HomePage';
import TermsAnalyzerPage from './pages/TermsAnalyzerPage';
import LegalAssistantPage from './pages/LegalAssistantPage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import DocumentComparePage from './pages/DocumentComparePage';
import DashboardPage from './pages/DashboardPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import LegalGlossaryPage from './pages/LegalGlossaryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="terms" element={<TermsAnalyzerPage />} />
            <Route path="legal-assistant" element={<LegalAssistantPage />} />
            <Route path="upload" element={<DocumentUploadPage />} />
            <Route path="compare" element={<DocumentComparePage />} />
            <Route path="glossary" element={<LegalGlossaryPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analysis/:id" element={<AnalysisDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </AuthProvider>
  );
}
