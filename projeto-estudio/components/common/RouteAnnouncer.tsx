// components/common/RouteAnnouncer.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const RouteAnnouncer: React.FC = () => {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Atraso intencional baseado na proporção áurea (161.8ms) para garantir 
    // que o DOM pintou antes de o leitor de ecrã anunciar.
    const timer = setTimeout(() => {
      let pageName = 'Página Inicial';
      if (location.pathname === '/privacidade') pageName = 'Política de Privacidade';
      if (location.pathname === '/termos') pageName = 'Termos e Condições';
      if (location.pathname.startsWith('/vip')) pageName = 'Área VIP';
      if (location.pathname.startsWith('/admin')) pageName = 'Painel Administrativo';
      
      setAnnouncement(`Navegou para ${pageName}`);
    }, 162);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div 
      aria-live="polite" 
      aria-atomic="true" 
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0'
      }}
    >
      {announcement}
    </div>
  );
};

export default RouteAnnouncer;
