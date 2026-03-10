import { formatInTimeZone } from 'date-fns-tz';
const TIMEZONE = 'Europe/Lisbon';
// Retorna a data atual de Portugal formatada para a base de dados
export const getPortugalNow = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
};
// Formata qualquer data para o padrão de exibição do Studio Braz
export const formatBrazDate = (date) => {
    return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
};
