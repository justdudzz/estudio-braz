// utils/seo.ts
import { BUSINESS_INFO, SERVICES_CONFIG } from './constants';

export const generateLocalBusinessSchema = () => {
  // Retorna o objeto puro, o App.tsx trata de fazer o JSON.stringify
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": BUSINESS_INFO.addressUrl,
    "name": BUSINESS_INFO.name,
    "image": "https://estudiobraz.pt/logo.png",
    "telephone": `+${BUSINESS_INFO.whatsapp}`,
    "email": BUSINESS_INFO.email,
    "url": "https://estudiobraz.pt",
    "priceRange": "€€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_INFO.address.split(',')[0],
      "addressLocality": "Águeda",
      "postalCode": "3750-303",
      "addressCountry": "PT"
    },
    "founder": {
      "@type": "Person",
      "name": BUSINESS_INFO.owner,
      "jobTitle": "Especialista em Estética Avançada",
      "url": BUSINESS_INFO.instagramPersonalUrl
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços de Estética de Luxo",
      "itemListElement": Object.values(SERVICES_CONFIG).map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.label
        },
        "position": index + 1
      }))
    }
  };
};