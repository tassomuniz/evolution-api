import { Readable } from 'node:stream';
import { Buffer } from 'buffer';
import { GoogleGenAI, LiveServerMessage, MediaResolution, Modality, Session } from '@google/genai';

export class GoogleAIClient {
  private ai: GoogleGenAI;
  private session?: Session;
  private responseQueue: LiveServerMessage[] = [];

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  initSession(): void {
    this.responseQueue = [];
  }

  async connectSession(systemPrompt: string): Promise<void> {
    this.session = await this.ai.live.connect({
      model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
      config: {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        systemInstruction: { parts: [{ text: systemPrompt }] }
      },
      callbacks: {
        onopen: (): void => console.log('[GAI] socket aberto'),
        onmessage: (msg: any): void => { this.responseQueue.push(msg); },
        onerror: (e: any): void => { console.error('[GAI] erro', e?.message); },
        onclose: (): void => console.log('[GAI] socket fechado')
      }
    });
  }

  async sendAudioChunk(chunk: Buffer): Promise<void> {
    if (this.session) {
      this.session.sendClientContent({ audio: { binary: chunk } });
    }
  }

  private async *collectResponse(): AsyncGenerator<Buffer> {
    let done = false;
    while (!done && this.session) {
      if (!this.responseQueue.length) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      const msg = this.responseQueue.shift()!;
      const parts = msg.serverContent?.modelTurn?.parts;
      if (parts) {
        for (const p of parts) {
          if (p.inlineData?.data) {
            yield Buffer.from(p.inlineData.data, 'base64');
          }
        }
      }
      if (msg.serverContent?.turnComplete) done = true;
    }
  }

  async finishStream(): Promise<Readable> {
    const stream = new Readable({ read() {} });
    for await (const chunk of this.collectResponse()) {
      stream.push(chunk);
    }
    stream.push(null);
    return stream;
  }

  closeSession(): void {
    this.session?.close();
    this.responseQueue = [];
  }
}
