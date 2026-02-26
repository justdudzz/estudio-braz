import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Utils & Contexts
import { BUSINESS_INFO } from './utils/constants';
import { initializeScriptsByConsent } from './utils/externalScripts';
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
import ProtectedRoute from './components/common/ProtectedRoute';

// Components - Sections
import HeroSection from './components/sections/HeroSection';
import ServicesGrid from './components/sections/ServicesGrid';
import SpecialistSection from './components/sections/SpecialistSection';
import TrustMirror from './components/sections/TrustMirror';
import Testimonials from './components/sections/Testimonials';
import GiftCardsSection from './components/sections/GiftCards';
import BookingForm from './components/sections/BookingForm';
import LocationMap from './components/sections/LocationMap';

// Components - Pages
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/TermsAndConditions';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminVipArea from './components/admin/VipArea';
import ClientVipArea from './components/vip/VipArea';

// ──────────────────────────────────────────────────────────────
// ISOLAMENTO DE EFEITOS (Portal para zero re-renders globais)
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

// ──────────────────────────────────────────────────────────────
// CONTEÚDO DA HOME (Otimizado para SEO & Conversão)
// ──────────────────────────────────────────────────────────────
const HomePageContent: React.FC = () => (
  <>
    <Helmet>
      <title>{BUSINESS_INFO.name} | Estética Avançada em Águeda</title>
      <meta name="description" content="Especialistas em Microblading, Limpeza de Pele e Unhas de Gel no Ameal, Águeda. Agende o seu momento de luxo com Mariana Braz." />
      <meta property="og:title" content={`${BUSINESS_INFO.name} - Beleza e Luxo`} />
      <meta property="og:description" content="Transformação e bem-estar com resultados naturais." />
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
// ORQUESTRADOR DE ROTAS
// ──────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeScriptsByConsent();
  }, [location.pathname]);

  return (
    <main className="flex-grow">
      <RouteAnnouncer /> 
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsAndConditions />} />
        <Route path="/vip" element={<ClientVipArea />} />
        
        {/* Rotas Administrativas Protegidas */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/vip" element={
          <ProtectedRoute requiredRole="admin">
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
        
        {/* Camada de Overlay e Persistência */}
        <VoucherManager />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App;