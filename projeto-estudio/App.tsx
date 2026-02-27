import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ClientLoginPage from './components/pages/ClientLoginPage';
// Utils & Contexts
import { BUSINESS_INFO } from './utils/constants';
import { generateLocalBusinessSchema } from './utils/seo';
import { AuthProvider } from './contexts/AuthContext';

// Components - Common & Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileMenuDrawer from './components/layout/MobileMenuDrawer';
import RouteAnnouncer from './components/common/RouteAnnouncer';
import CookieBanner from './components/common/CookieBanner';
import VoucherPopup from './components/common/VoucherPopup';
import NotFound from './components/common/NotFound';

// Components - Sections
import HeroSection from './components/sections/HeroSection';
import ServicesGrid from './components/sections/ServicesGrid';
import SpecialistSection from './components/sections/SpecialistSection';
import TrustMirror from './components/sections/TrustMirror';
import Testimonials from './components/sections/Testimonials';
import GiftCardsSection from './components/sections/GiftCards';
import BookingForm from './components/sections/BookingForm';
import LocationMap from './components/sections/LocationMap';

// Components - Pages & Admin
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/TermsAndConditions';
import LoginPage from './components/pages/LoginPage'; // <- Caminho corrigido!
import AdminDashboard from './components/admin/AdminDashboard'; // <- Agora aponta para a nossa Sala de Comando
import AdminVipArea from './components/admin/VipArea';
import ClientVipArea from './components/vip/VipArea';
import ProtectedRoute from './components/auth/ProtectedRoute'; // <- Caminho corrigido para o escudo de segurança!

// ──────────────────────────────────────────────────────────────
// ISOLAMENTO DE EFEITOS E SEO (Mantido intacto)
// ──────────────────────────────────────────────────────────────
const VoucherManager: React.FC = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem('braz_voucher_seen');
      if (!hasSeen) {
        setShow(true);
        localStorage.setItem('braz_voucher_seen', 'true');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  if (!show) return null;
  return <VoucherPopup onClose={() => setShow(false)} />;
};

const HomePageContent: React.FC = () => (
  <>
    <Helmet>
      <title>{BUSINESS_INFO.name} | Estética Avançada em Águeda</title>
      <meta name="description" content="Especialistas em Microblading, Limpeza de Pele e Unhas de Gel no Ameal, Águeda. Agende o seu momento de luxo com Mariana Braz." />
      <link rel="canonical" href="https://estudiobraz.pt" />
      <script type="application/ld+json">
        {JSON.stringify(generateLocalBusinessSchema())}
      </script>
    </Helmet>
    <HeroSection />
    <ServicesGrid />
    <SpecialistSection />
    <TrustMirror /> 
    <Testimonials />
    <GiftCardsSection />
    <BookingForm />
    <LocationMap />
  </>
);

// ──────────────────────────────────────────────────────────────
// ORQUESTRADOR DE ROTAS AFINADO
// ──────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <main className="flex-grow">
      <RouteAnnouncer /> 
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsAndConditions />} />
        <Route path="/vip/login" element={<ClientLoginPage />} />
        
        {/* Porta de Entrada do Diretor */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Área VIP */}
        <Route path="/vip" element={<ClientVipArea />} />
        
        {/* Rotas Administrativas Blindadas */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/vip" element={
          <ProtectedRoute>
            <AdminVipArea />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
};

// ──────────────────────────────────────────────────────────────
// APP ENTRY POINT
// ──────────────────────────────────────────────────────────────
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="bg-braz-black min-h-screen font-montserrat antialiased flex flex-col">
        <Navbar onMenuToggle={() => setIsMenuOpen(prev => !prev)} isMenuOpen={isMenuOpen} />
        <AppContent />
        <Footer />
        <MobileMenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <VoucherManager />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App;