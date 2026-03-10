import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🛡️ BRAZ MASTER BACKUP SYSTEM (Security #13)
 * Automatização de backup diário do PostgreSQL.
 */
const backupDatabase = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    const fileName = `studio_braz_backup_${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    // Nota: Requer pg_dump instalado no sistema (standard em PostgreSQL)
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        logger.error('❌ DATABASE_URL não definida. Backup abortado.');
        return;
    }

    logger.info(`💾 A iniciar backup de elite: ${fileName}...`);

    // Extrair componentes da URL para o comando pg_dump se necessário, ou usar a URL direto
    // pg_dump --dbname=postgresql://user:pass@host:port/db > file.sql
    const command = `pg_dump --dbname="${dbUrl}" > "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            logger.error(`❌ Falha no Backup: ${error.message}`);
            return;
        }
        if (stderr) {
            logger.warn(`⚠️ Aviso no Backup: ${stderr}`);
        }
        
        // Comprimir se necessário (opcional)
        logger.info(`✅ BACKUP CONCLUÍDO COM SUCESSO. Localização: ${filePath}`);
        
        // Limpeza: Manter apenas os últimos 7 backups
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('studio_braz_backup_'))
            .sort((a, b) => fs.statSync(path.join(backupDir, b)).mtime.getTime() - fs.statSync(path.join(backupDir, a)).mtime.getTime());

        if (files.length > 7) {
            files.slice(7).forEach(file => {
                fs.unlinkSync(path.join(backupDir, file));
                logger.info(`🧹 Limpeza: Backup antigo removido: ${file}`);
            });
        }
    });
};

// Executar se chamado diretamente
if (import.meta.url.endsWith(path.basename(process.argv[1]))) {
    backupDatabase();
}

export default backupDatabase;
