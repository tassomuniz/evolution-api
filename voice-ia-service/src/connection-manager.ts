import { Socket } from 'socket.io';
import { CallHandler } from './call-handler';

/**
 * Classe Singleton para gerenciar o estado da conexão e o CallHandler.
 * Isso permite que diferentes partes da aplicação (API REST e Socket.IO)
 * compartilhem o mesmo estado e instâncias.
 */
class ConnectionManager {
  private static instance: ConnectionManager;
  private activeSocket: Socket | null = null;
  public readonly callHandler: CallHandler;

  private constructor() {
    this.callHandler = new CallHandler();
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * Define o socket da Evolution API atualmente ativo.
   * @param socket O socket da conexão.
   */
  public setActiveSocket(socket: Socket) {
    console.log(`[ConnectionManager] Nova conexão ativa definida: ${socket.id}`);
    this.activeSocket = socket;
  }

  /**
   * Limpa o socket ativo (usado na desconexão).
   */
  public clearActiveSocket() {
    if (this.activeSocket) {
      console.log(`[ConnectionManager] Conexão removida: ${this.activeSocket.id}`);
      this.activeSocket = null;
    }
  }

  /**
   * Inicia uma chamada de saída usando o socket ativo.
   * @param number O número para o qual ligar.
   */
  public initiateOutgoingCall(number: string) {
    if (this.activeSocket) {
      this.callHandler.initiateOutgoingCall(this.activeSocket, number);
    } else {
      console.error('[ConnectionManager] Erro: Nenhuma conexão da Evolution API está ativa para iniciar a chamada.');
      throw new Error('Nenhuma conexão da Evolution API está ativa.');
    }
  }
}

// Exporta uma instância única do gerenciador para ser usada em toda a aplicação.
export const connectionManager = ConnectionManager.getInstance();
