// backend/src/utils/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';
/**
 * 🛡️ LOG SANITIZER (Point #18)
 * Mascara campos sensíveis para nunca tocarem no disco.
 */
const maskSecrets = winston.format((info) => {
    const secrets = ['password', 'token', 'secret', 'otp', 'twoFactorSecret'];
    const mask = (obj) => {
        for (const key in obj) {
            if (secrets.some(s => key.toLowerCase().includes(s))) {
                obj[key] = '********';
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                mask(obj[key]);
            }
        }
    };
    mask(info);
    return info;
});
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), maskSecrets(), winston.format.json()),
    transports: [
        // Rotação diária de erros
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d'
        }),
        // Rotação diária de atividades completas
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        }),
    ],
});
// Suporte para o terminal (Cores)
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }));
}
export default logger;
