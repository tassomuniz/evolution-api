// Eventos que o cliente envia para o servidor
export interface ClientToServerEvents {
  init: (me: any, account: any, status: any) => void;
  'CB:call': (pkt: any) => void;
  'CB:ack,class:call': (pkt: any) => void;
  'audio:stream': (chunk: Buffer) => void;
  'audio:end': () => void;
}

// Eventos que o servidor envia para o cliente
export interface ServerToClientEvents {
  'audio:response': (chunk: Buffer) => void;
}
