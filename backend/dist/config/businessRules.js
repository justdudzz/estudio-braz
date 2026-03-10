/**
 * 🏛️ REGRAS DE NEGÓCIO CENTRALIZADAS (Point #23)
 * Este é o cérebro das regras do Estúdio Braz.
 * Deve estar em sincronia total com o Frontend (/projeto-estudio/utils/constants.ts)
 */
export const SERVICES_CONFIG = {
    'Microblading': { label: 'Microblading', duration: 150, buffer: 15, price: 250 },
    'Limpeza de Pele': { label: 'Limpeza de Pele', duration: 90, buffer: 15, price: 60 },
    'Unhas de Gel': { label: 'Unhas de Gel', duration: 90, buffer: 10, price: 35 },
    'Verniz Gel': { label: 'Verniz Gel', duration: 45, buffer: 5, price: 20 },
    'Massagem': { label: 'Massagem', duration: 60, buffer: 15, price: 45 },
    'Depilacao': { label: 'Depilação', duration: 30, buffer: 5, price: 15 },
};
export const BUSINESS_HOURS = {
    start: 9,
    end: 20,
    saturdayEnd: 13
};
