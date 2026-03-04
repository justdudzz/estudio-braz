import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // Opcional, mas recomendado para SEO
import App from './App.tsx';
import ErrorBoundary from './src/components/common/ErrorBoundary.tsx';
import './index.css';

/**
 * 1. Verificação de Segurança do DOM:
 * Garante que o elemento root existe antes de tentar renderizar,
 * evitando erros silenciosos em ambientes de execução instáveis.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Falha ao encontrar o elemento root. A aplicação não pôde ser iniciada.');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    {/* 2. HelmetProvider:
      Permite que cada página (Home, Privacidade, VIP) defina o seu próprio 
      título e meta-tags de forma dinâmica para um SEO perfeito.
    */}
    <HelmetProvider>
      <Router>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  </StrictMode>,
);
