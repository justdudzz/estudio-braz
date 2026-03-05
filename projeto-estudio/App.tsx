import React, { useState, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ Autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 🗺️ Layout & Componentes Comuns (sempre carregados)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/common/CookieBanner';
import NetworkStatus from './components/common/NetworkStatus';
import { ToastProvider } from './components/common/Toast';
import ScrollToTop from './utils/scroll';
import PWAUpdatePrompt from './src/components/common/PWAUpdatePrompt';

import AnimatedCursor from './components/common/AnimatedCursor';
import FloatingWhatsApp from './components/common/FloatingWhatsApp';

// 🏠 Homepage (carregamento imediato — primeira impressão)
import HomePage from './components/pages/HomePage';

// ⚡ Code-Splitting: Páginas carregadas sob demanda (React.lazy)
const ServicesPage = React.lazy(() => import('./components/pages/ServicesPage'));
const PortfolioPage = React.lazy(() => import('./components/pages/PortfolioPage'));
const AboutPage = React.lazy(() => import('./components/pages/AboutPage'));
const BookingPage = React.lazy(() => import('./components/pages/BookingPage'));
const ContactPage = React.lazy(() => import('./components/pages/ContactPage'));
const FAQPage = React.lazy(() => import('./components/pages/FAQPage'));
const GiftCardsPage = React.lazy(() => import('./components/pages/GiftCardsPage'));
const LoginPage = React.lazy(() => import('./components/pages/LoginPage'));
const ClientLoginPage = React.lazy(() => import('./components/pages/ClientLoginPage'));
const VipArea = React.lazy(() => import('./components/vip/VipArea'));
const PrivacyPolicy = React.lazy(() => import('./components/pages/PrivacyPolicy'));
const TermsAndConditions = React.lazy(() => import('./components/pages/TermsAndConditions'));

// 🏛️ Admin (lazy — só carrega quando o admin faz login)
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const BookingsTable = React.lazy(() => import('./components/admin/BookingsTable'));
const AdminVipArea = React.lazy(() => import('./components/admin/VipArea'));
const BlockManagement = React.lazy(() => import('./components/admin/BlockManagement'));
const SettingsPage = React.lazy(() => import('./components/admin/SettingsPage'));
const ReportsPage = React.lazy(() => import('./components/admin/ReportsPage'));
import { AdminDataProvider } from './contexts/AdminDataContext';
const NotFoundPage = React.lazy(() => import('./components/common/NotFoundPage'));

// Fallback de carregamento
const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
    <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
  </div>
);

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
    <div className="flex flex-col min-h-screen bg-braz-black overscroll-y-none gpu-accelerated">
      <Navbar onMenuToggle={() => setIsMenuOpen(prev => !prev)} isMenuOpen={isMenuOpen} />
      <main className="flex-grow pt-[112px]">
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

      <Suspense fallback={<LazyFallback />}>
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
      </Suspense>

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
