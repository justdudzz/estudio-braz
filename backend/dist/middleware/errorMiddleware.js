import logger from '../utils/logger.js';
export const notFound = (req, res, next) => {
    const error = new Error(`Caminho não encontrado - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const message = err?.message || 'Erro desconhecido';
    console.error(`[BACKEND ERROR] ${req.method} ${req.originalUrl}:`, err);
    logger.error(`${message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`, {
        stack: err?.stack,
        body: req.body
    });
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? '🔒' : err?.stack,
    });
};
