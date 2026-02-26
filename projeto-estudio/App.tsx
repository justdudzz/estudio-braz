import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BUSINESS_INFO } from './utils/constants';

// 1. Importe o utilitário
import { initializeScriptsByConsent } from './utils/externalScripts';

// Contextos e Proteção
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout & Common
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileMenuDrawer from './components/layout/MobileMenuDrawer';
import CookieBanner from './components/common/CookieBanner';
import VoucherPopup from './components/common/VoucherPopup';
import NotFound from './components/common/NotFound';

// Pages & Sections
import HeroSection from './components/sections/HeroSection';
import ServicesGrid from './components/sections/ServicesGrid';
import SpecialistSection from './components/sections/SpecialistSection';
import GiftCardsSection from './components/sections/GiftCards';
import BookingForm from './components/sections/BookingForm';
import LocationMap from './components/sections/LocationMap';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/TermsAndConditions';

// Admin & VIP
import AdminDashboard from './components/admin/AdminDashboard';
import AdminVipArea from './components/admin/VipArea';
import ClientVipArea from './components/vip/VipArea';

/**
 * Componente para renderizar o conteúdo da página inicial (Landing Page)
 */
const HomePageContent: React.FC = () => (
  <>
    <Helmet>
      <title>{BUSINESS_INFO.name} | Estética Avançada em Águeda</title>
      <meta name="description" content="Especialistas em Microblading, Limpeza de Pele e Unhas de Gel no Ameal, Águeda. Agende o seu momento de luxo com Mariana Braz." />
      <meta property="og:title" content={`${BUSINESS_INFO.name} - Beleza e Luxo`} />
      <meta property="og:description" content="Transformação e bem-estar com resultados naturais." />
      <link rel="canonical" href="https://estudiobraz.pt" />
    </Helmet>

    <HeroSection />
    <ServicesGrid />
    <SpecialistSection />
    <GiftCardsSection />
    <BookingForm />
    <LocationMap />
  </>
);

/**
 * Gestor principal de conteúdo e rotas
 */
const AppContent: React.FC = () => {
  const [showVoucher, setShowVoucher] = useState(false);
  const location = useLocation();

  // Scroll para o topo em cada mudança de rota + inicialização de scripts
  useEffect(() => {
    window.scrollTo(0, 0);
    // 2. Tentar carregar scripts se já houver consentimento guardado
    initializeScriptsByConsent();
  }, [location.pathname]);

  // Lógica do Voucher Popup (Aparece após 5 segundos se não tiver sido visto)
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenVoucher = localStorage.getItem('braz_voucher_seen');
      if (!hasSeenVoucher) {
        setShowVoucher(true);
        localStorage.setItem('braz_voucher_seen', 'true');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="flex-grow">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePageContent />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos" element={<TermsAndConditions />} />

          {/* VIP Area (Pública inicialmente para login) */}
          <Route path="/vip" element={<ClientVipArea />} />

          {/* Rotas Administrativas Protegidas */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vip"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminVipArea />
              </ProtectedRoute>
            }
          />

          {/* 404 - Página Não Encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Componentes Flutuantes/Globais */}
      {showVoucher && <VoucherPopup onClose={() => setShowVoucher(false)} />}

      {/* O WhatsAppButton foi removido daqui para não aparecer no canto inferior */}
    </>
  );
};

/**
 * Componente Root da Aplicação
 */
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="bg-[#0A0A0A] min-h-screen font-montserrat antialiased flex flex-col">
        <Navbar
          onMenuToggle={() => setIsMenuOpen(prev => !prev)}
          isMenuOpen={isMenuOpen}
        />

        <AppContent />

        <Footer />

        <MobileMenuDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App; 