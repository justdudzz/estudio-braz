// backend/src/utils/logger.ts
import winston from 'winston';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        // Grava erros em ficheiro para análise posterior
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Grava todas as atividades
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});
// Se não estivermos em produção, mostra também no terminal com cores
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
export default logger;
