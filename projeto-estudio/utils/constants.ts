/**
 * constants.ts
 * Ficheiro central de configuração do Studio Braz.
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
    address: "R. Chão de Frade 3, 3750-303 Águeda",
    addressUrl: "https://www.google.com/maps/search/?api=1&query=Studio+Braz+Agueda",
    ralName: "CNIACC - Centro Nacional de Informação e Arbitragem de Conflitos de Consumo",
    ralUrl: "https://www.cniacc.pt/pt/",
};

export const UI_COLORS = {
    gold: "#C5A059",
    black: "#0A0A0A",
    cream: "#F5F5F5",
};

// 🟢 ADICIONADO: Configuração dos Serviços para o Agendamento
export const SERVICES_CONFIG = {
  'Microblading':    { label: 'Microblading', duration: 150, buffer: 15 },
  'Limpeza de Pele': { label: 'Limpeza de Pele', duration: 90, buffer: 15 },
  'Unhas de Gel':    { label: 'Unhas de Gel', duration: 90, buffer: 10 },
  'Verniz Gel':      { label: 'Verniz Gel', duration: 45, buffer: 5 },
  'Massagem':        { label: 'Massagem', duration: 60, buffer: 15 },
  'Depilacao':       { label: 'Depilação', duration: 30, buffer: 5 },
};

// 🟢 ADICIONADO: Horário de Funcionamento
export const OPENING_HOURS = {
  start: 9,        // 09:00
  end: 20,         // 20:00
  weekendStart: 9, 
  weekendEnd: 13,  // Sábados até às 13:00
};