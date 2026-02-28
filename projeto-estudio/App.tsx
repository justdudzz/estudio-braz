import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ Autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext'; 

// 🗺️ Layout & Componentes Comuns
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/common/CookieBanner';
import NetworkStatus from './components/common/NetworkStatus';
import ScrollToTop from './utils/scroll'; // Importação do ScrollToTop

// 🎨 Secções da Página Principal (A Montra)
import HeroSection from './components/sections/HeroSection';
import TrustMirror from './components/sections/TrustMirror';
import ServicesGrid from './components/sections/ServicesGrid';
import SpecialistSection from './components/sections/SpecialistSection';
import Gallery from './components/sections/Gallery';
import Testimonials from './components/sections/Testimonials';
import BookingForm from './components/sections/BookingForm';
import LocationMap from './components/sections/LocationMap';

// 🔑 Páginas de Login e Áreas Restritas
import LoginPage from './components/pages/LoginPage';
import ClientLoginPage from './components/pages/ClientLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import VipArea from './components/vip/VipArea';

// 📜 Páginas Legais
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/TermsAndConditions';

// Componente de Proteção de Rota
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: 'admin' | 'client' }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/login' : '/vip/login'} />;
  }
  
  if (user?.role !== role) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Layout Padrão para páginas públicas (Com Navbar e Footer)
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen bg-braz-black">
    <Navbar />
    <main className="flex-grow pt-[104px] md:pt-[130px]">
      {children}
    </main>
    <Footer />
  </div>
);

const AppContent = () => {
  return (
    <>
      <ScrollToTop />
      <NetworkStatus />
      
      <Routes>
        {/* 🏠 Home: O Império Completo */}
        <Route path="/" element={
          <PublicLayout>
            <HeroSection />
            <TrustMirror />
            <ServicesGrid />
            <SpecialistSection />
            <Gallery />
            <Testimonials />
            <BookingForm />
            <LocationMap />
          </PublicLayout>
        } />
        
        {/* ⚖️ Páginas Legais */}
        <Route path="/politica-privacidade" element={
          <PublicLayout>
            <PrivacyPolicy />
          </PublicLayout>
        } />
        <Route path="/termos-condicoes" element={
          <PublicLayout>
            <TermsAndConditions />
          </PublicLayout>
        } />

        {/* 🔑 Logins (Sem Navbar gigante) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/vip/login" element={<ClientLoginPage />} />

        {/* 🏛️ Admin Dashboard (Protegido) */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 💎 Área VIP da Cliente (Protegido) */}
        <Route path="/vip" element={
          <ProtectedRoute role="client">
            <VipArea />
          </ProtectedRoute>
        } />

        {/* 🔄 Redirecionamento de segurança para links quebrados */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <CookieBanner />
    </>
  );
};

// O componente App invólucro limpo
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;