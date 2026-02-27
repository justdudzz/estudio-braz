/**
 * db.ts - Motor de Ligação à Base de Dados Soberana
 */
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    
    console.log(`
    -------------------------------------------
    📦 Memória Digital: CONECTADA
    🌐 Host: ${conn.connection.host}
    📂 Base de Dados: studio_braz
    -------------------------------------------
    `);
  } catch (error) {
    console.error(`❌ Erro Crítico de Memória: ${error}`);
    process.exit(1); // Encerra se não conseguir ligar à base de dados
  }
};