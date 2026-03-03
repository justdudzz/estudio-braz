import logger from '../utils/logger.js';
export const notFound = (req, res, next) => {
    const error = new Error(`Caminho não encontrado - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    // Logamos o erro internamente para o Diretor ver
    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    res.status(statusCode).json({
        message: err.message,
        // Em produção ocultamos o stack trace para não dar pistas a hackers
        stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack,
    });
};
