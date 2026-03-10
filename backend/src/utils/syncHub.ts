// backend/src/utils/syncHub.ts
import logger from './logger.js';

/**
 * 🛰️ CEO SYNC HUB
 * Controla a versão global dos dados do Estúdio.
 * Sempre que algo muda (booking, staff, despesa), incrementamos a versão.
 */
class SyncHub {
  private version: number = Date.now();

  // Retorna a versão atual
  getVersion() {
    return this.version;
  }

  // Incrementa para forçar os clientes a atualizarem
  notifyChange(reason?: string) {
    this.version = Date.now();
    if (reason) {
      logger.info(`🔄 [SyncHub] Mudança detetada: ${reason}. Versão: ${this.version}`);
    }
  }
}

export const syncHub = new SyncHub();
