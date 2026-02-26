/**
 * utils/externalScripts.ts
 * Gere o carregamento condicional de ferramentas de terceiros (GA4 e FB Pixel).
 */

// IDs Gratuitos (Substitua pelos seus reais quando criar as contas)
// Se ainda não tiver, mantenha estes placeholders por enquanto.
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 
const FB_PIXEL_ID = 'XXXXXXXXXXXXXXX';

/**
 * Injeta o Google Analytics 4 (Estatísticas)
 */
export const loadGA4 = () => {
  // Evita carregar duas vezes
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { 'anonymize_ip': true });
  `;
  document.head.appendChild(inlineScript);
  
  console.log('📊 GA4: Ativado com sucesso.');
};

/**
 * Injeta o Facebook Pixel (Marketing)
 */
export const loadFBPixel = () => {
  if (document.getElementById('fb-pixel-script')) return;

  const script = document.createElement('script');
  script.id = 'fb-pixel-script';
  script.innerHTML = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
  console.log('🎯 FB Pixel: Ativado com sucesso.');
};

/**
 * Função Mestra: Verifica o consentimento e carrega o que for permitido.
 * Pode ser chamada ao iniciar a App ou ao guardar o banner de cookies.
 */
export const initializeScriptsByConsent = () => {
  // Lê a preferência guardada
  const consentData = localStorage.getItem('braz_cookies_preferences');
  
  // Se não houver consentimento guardado, não faz nada (respeita a privacidade por defeito)
  if (!consentData) return;

  try {
    const { analytics, marketing } = JSON.parse(consentData);
    
    // Carrega apenas o que foi autorizado
    if (analytics) loadGA4();
    if (marketing) loadFBPixel();
    
  } catch (error) {
    console.error('Erro ao processar preferências de cookies:', error);
  }
};