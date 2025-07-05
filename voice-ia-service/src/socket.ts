import { Server, Socket } from 'socket.io';
import { GoogleAIClient } from './google-ai-client';
import { connectionManager } from './connection-manager';
import { ServerToClientEvents, ClientToServerEvents } from './types';
import dotenv from 'dotenv';
dotenv.config();



export function setupSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
    transports: ['websocket']
  });

  // Namespace para emular o wavoip e ser compatível com a Evolution API
  io.of('/baileys').on('connection', (socket: Socket) => {
    console.log(`[Socket] Evolution API conectada ao namespace /baileys. ID da conexão: ${socket.id}`);

    // Registra o socket ativo no ConnectionManager
    connectionManager.setActiveSocket(socket);

    // A autenticação do wavoip é feita via um evento 'auth' ou similar após a conexão.
    // Por enquanto, vamos focar em receber os eventos de chamada.

    socket.on('CB:call', (packet) => {
      console.log('[Socket] Evento de chamada recebido (CB:call):', packet);
      connectionManager.callHandler.handleCallEvent(socket, packet); // Delega o evento para o CallHandler
    });

    socket.on('CB:ack,class:call', (packet) => {
      console.log('[Socket] Evento de confirmação de chamada recebido (CB:ack,class:call):', packet);
      // TODO: Fase 2 - Atualizar o estado da chamada no CallHandler
    });

    socket.on('connection.update', (data) => {
      console.log('[Socket] Evento de atualização de conexão recebido (connection.update):', data);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Evolution API desconectada do namespace /baileys. Razão: ${reason}`);
      connectionManager.clearActiveSocket();
    });

    socket.on('error', (err) => {
      console.error('[Socket] Erro na conexão com a Evolution API:', err);
    });
  });
}
