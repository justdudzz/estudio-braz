/**
 * utils/constants.ts
 * Núcleo de Identidade Imutável do Studio Braz.
 * Ajuste: Congelamento de tipos (as const) para integridade sistêmica.
 */

export const BUSINESS_INFO = {
    name: "Studio Braz",
    owner: "Mariana Braz",
    nif: "123456789",
    whatsapp: "351914843087",
    whatsappMsg: encodeURIComponent("Olá Mariana, gostaria de agendar um momento de luxo no Studio Braz."),
    instagram: "studiobraz.estetica",
    instagramUrl: "https://instagram.com/studiobraz.estetica/",
    instagramPersonal: "mariianabraz.estetica",
    instagramPersonalUrl: "https://instagram.com/mariianabraz.estetica/",
    email: "suporte@estudiobraz.pt",
    address: "Studio Braz, R. Chão de Frade 3, 3750-303 Águeda",
    addressUrl: "https://maps.google.com/?q=Studio+Braz,+R.+Chão+de+Frade+3,+3750-303+Águeda",
    ralName: "CNIACC - Centro Nacional de Informação e Arbitragem de Conflitos de Consumo",
    ralUrl: "https://www.cniacc.pt/pt/",
} as const;

export const UI_COLORS = {
    gold: "#C5A059",
    black: "#0A0A0A",
    cream: "#F5F5F5",
    phi: 1.618, // Injeção da Proporção Áurea (Golden Ratio)
} as const;

/**
 * Configuração dos Serviços (Unificado com Backend)
 * Duração e Buffer em minutos.
 * 'as const' garante que as chaves e valores sejam tratados como literais imutáveis.
 */
export const SERVICES_CONFIG = {
    'Microblading': { label: 'Microblading', duration: 150, buffer: 15, price: 250 },
    'Limpeza de Pele': { label: 'Limpeza de Pele', duration: 90, buffer: 15, price: 60 },
    'Unhas de Gel': { label: 'Unhas de Gel', duration: 90, buffer: 10, price: 35 },
    'Verniz Gel': { label: 'Verniz Gel', duration: 45, buffer: 5, price: 20 },
    'Massagem': { label: 'Massagem', duration: 60, buffer: 15, price: 45 },
    'Depilacao': { label: 'Depilação', duration: 30, buffer: 5, price: 15 },
} as const;

export const OPENING_HOURS = {
    start: 9,        // 09:00
    end: 20,         // 20:00
    weekendStart: 9,
    weekendEnd: 13,  // Sábados até às 13:00
} as const;

// Tipagem utilitária derivada das constantes para uso em Props e States
export type ServiceType = keyof typeof SERVICES_CONFIG;