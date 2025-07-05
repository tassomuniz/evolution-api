import { Socket } from 'socket.io';
import { GoogleAIClient } from './google-ai-client';

// Interface para representar uma sessão de chamada ativa
interface CallSession {
  id: string;
  socket: Socket;
  googleAIClient: GoogleAIClient;
  startTime: Date;
}

export class CallHandler {
  private activeCalls: Map<string, CallSession> = new Map();

  /**
   * Gerencia os eventos de chamada recebidos da Evolution API.
   * @param socket O socket da conexão com a Evolution API.
   * @param packet O pacote de dados do evento.
   */
  public handleCallEvent(socket: Socket, packet: any) {
    // Extrai informações do pacote de chamada
    const callId = packet[1]?.id;
    const from = packet[1]?.from;
    const status = packet[2]?.[0]?.tag;

    if (!callId || !from) {
      console.log('[CallHandler] Pacote de chamada inválido, ignorando.', packet);
      return;
    }

    console.log(`[CallHandler] Evento de chamada recebido: ID=${callId}, De=${from}, Status=${status}`);

    // Se for uma nova oferta de chamada, aceita e inicia a sessão de IA
    if (status === 'offer') {
      this.acceptCallAndStartSession(socket, callId, from);
    }
  }

  /**
   * Aceita uma chamada e inicia uma nova sessão com o Gemini.
   * @param socket O socket da conexão.
   * @param callId O ID da chamada.
   * @param from O JID de quem está ligando.
   */
  private async acceptCallAndStartSession(socket: Socket, callId: string, from: string) {
    console.log(`[CallHandler] Aceitando chamada ${callId} de ${from}...`);

    // 1. Envia o comando para a Evolution API aceitar a chamada
    socket.emit('sendNode', {
      tag: 'call',
      attrs: {
        to: from,
        id: callId,
      },
      content: [
        {
          tag: 'accept',
          attrs: {},
        },
      ],
    });

    console.log(`[CallHandler] Comando para aceitar a chamada ${callId} enviado.`);

    // 2. Cria e armazena a sessão da chamada
    const googleAIClient = new GoogleAIClient(process.env.GEMINI_API_KEY || 'gemini-api-key');
    this.activeCalls.set(callId, {
      id: callId,
      socket,
      googleAIClient,
      startTime: new Date(),
    });

    // 3. Inicia a sessão com o Gemini
    await googleAIClient.initSession();
    await googleAIClient.connectSession('Você é um assistente de voz prestativo. Seja breve e direto em suas respostas.');

    console.log(`[CallHandler] Sessão com Gemini iniciada para a chamada ${callId}.`);
  }

  /**
   * Inicia uma chamada de saída para um número específico.
   * @param socket O socket da conexão com a Evolution API.
   * @param number O número para o qual ligar.
   */
  public async initiateOutgoingCall(socket: Socket, number: string) {
    const callId = Date.now().toString(); // Gera um ID de chamada único
    const to = `${number}@s.whatsapp.net`; // Formata o JID do WhatsApp
    console.log(`[CallHandler] Iniciando chamada de saída para ${number} com ID ${callId}...`);

    // Envia o comando para a Evolution API iniciar a chamada
    socket.emit('sendNode', {
      tag: 'call',
      attrs: {
        to: to,
        id: callId,
      },
      content: [
        {
          tag: 'offer',
          attrs: {},
        },
      ],
    });

    console.log(`[CallHandler] Comando para iniciar a chamada para ${to} enviado.`);
    // A lógica para iniciar a sessão do Gemini para chamadas de saída
    // será acionada quando recebermos o evento de confirmação ('accept' ou similar).
  }

  // TODO: Adicionar método para finalizar chamada e sessão com o Gemini
}
