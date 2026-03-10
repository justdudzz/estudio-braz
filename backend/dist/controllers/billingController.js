import * as billingService from '../services/billingService.js';
import logger from '../utils/logger.js';
export const downloadSaft = async (req, res) => {
    const { month, year, nif } = req.query;
    try {
        const data = await billingService.getSaftData(Number(month), Number(year), nif);
        res.header('Content-Type', 'application/xml');
        res.attachment(data.filename);
        res.send(data.content);
    }
    catch (error) {
        logger.error('Erro Saft:', error);
        res.status(500).json({ message: 'Erro ao gerar SAFT-T' });
    }
};
export const getMonthlyReport = async (req, res) => {
    const { month, year } = req.query;
    try {
        const report = await billingService.generateMonthlyClosure(Number(month), Number(year));
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao gerar relatório' });
    }
};
