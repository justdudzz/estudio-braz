// utils/seo.ts
import { BUSINESS_INFO, SERVICES_CONFIG } from './constants';

export const generateLocalBusinessSchema = () => {
  // Retorna o objeto puro, o App.tsx trata de fazer o JSON.stringify
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": BUSINESS_INFO.addressUrl,
    "name": BUSINESS_INFO.name,
    "image": "https://studiobraz.pt/faviconBraz4.png",
    "telephone": `+${BUSINESS_INFO.whatsapp}`,
    "email": BUSINESS_INFO.email,
    "url": "https://studiobraz.pt",
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
      "jobTitle": "Esteticista e Cosmetologista",
      "url": BUSINESS_INFO.instagramPersonalUrl
    },
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "19:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "08:00", "closes": "14:00" }
    ],
    "paymentAccepted": "Cash, MBWay",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços de Estética e Bem-Estar",
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