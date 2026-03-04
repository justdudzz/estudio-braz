import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ Autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 🗺️ Layout & Componentes Comuns
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/common/CookieBanner';
import NetworkStatus from './components/common/NetworkStatus';
import { ToastProvider } from './components/common/Toast';
import ScrollToTop from './utils/scroll';
import PWAUpdatePrompt from './src/components/common/PWAUpdatePrompt';

import AnimatedCursor from './components/common/AnimatedCursor';
import FloatingWhatsApp from './components/common/FloatingWhatsApp';

// 🎨 Páginas Públicas
import HomePage from './components/pages/HomePage';
import ServicesPage from './components/pages/ServicesPage';
import PortfolioPage from './components/pages/PortfolioPage';
import AboutPage from './components/pages/AboutPage';
import BookingPage from './components/pages/BookingPage';
import ContactPage from './components/pages/ContactPage';
import FAQPage from './components/pages/FAQPage';
import GiftCardsPage from './components/pages/GiftCardsPage';

// 🔑 Páginas de Login e Áreas Restritas
import LoginPage from './components/pages/LoginPage';
import ClientLoginPage from './components/pages/ClientLoginPage';
import VipArea from './components/vip/VipArea';

// 📜 Páginas Legais
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/TermsAndConditions';

// 🏛️ Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import BookingsTable from './components/admin/BookingsTable';
import AdminVipArea from './components/admin/VipArea';
import BlockManagement from './components/admin/BlockManagement';
import SettingsPage from './components/admin/SettingsPage';
import ReportsPage from './components/admin/ReportsPage';
import { AdminDataProvider } from './contexts/AdminDataContext';
import NotFoundPage from './components/common/NotFoundPage';

// Proteção de Rota
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: 'admin' | 'client' }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to={role === 'admin' ? '/login' : '/vip/login'} />;
  if (user?.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

// Layout Público (Com Navbar e Footer)
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="flex flex-col min-h-screen bg-braz-black">
      <Navbar onMenuToggle={() => setIsMenuOpen(prev => !prev)} isMenuOpen={isMenuOpen} />
      <main className="flex-grow pt-[104px] md:pt-[130px]">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

const AppContent = () => {
  return (
    <>
      <ScrollToTop />
      <PWAUpdatePrompt />
      <NetworkStatus />

      <Routes>
        {/* 🏠 Home */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />

        {/* 📄 Páginas Públicas */}
        <Route path="/servicos" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/portfolio" element={<PublicLayout><PortfolioPage /></PublicLayout>} />
        <Route path="/sobre" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/agendar" element={<PublicLayout><BookingPage /></PublicLayout>} />
        <Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
        <Route path="/cartoes-presente" element={<PublicLayout><GiftCardsPage /></PublicLayout>} />

        {/* ⚖️ Legais */}
        <Route path="/politica-privacidade" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
        <Route path="/termos-condicoes" element={<PublicLayout><TermsAndConditions /></PublicLayout>} />

        {/* 🔑 Logins */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/vip/login" element={<ClientLoginPage />} />

        {/* 🏛️ Admin — Sidebar Layout com Sub-rotas */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDataProvider>
              <AdminLayout />
            </AdminDataProvider>
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="agenda" element={<BookingsTable />} />
          <Route path="clientes" element={<AdminVipArea />} />
          <Route path="bloqueios" element={<BlockManagement />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
        </Route>

        {/* 💎 Área VIP */}
        <Route path="/vip" element={
          <ProtectedRoute role="client">
            <VipArea />
          </ProtectedRoute>
        } />

        {/* 🔄 Catch-all Luxury 404 (Point #20) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <CookieBanner />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AnimatedCursor />
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;