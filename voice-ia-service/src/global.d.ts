declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(opts: any);
    live: {
      connect(opts: any): Promise<any>;
    };
  }
  export type LiveServerMessage = any;
  export enum MediaResolution { MEDIA_RESOLUTION_MEDIUM = 0 }
  export enum Modality { AUDIO = 0 }
  export type Session = any;
}
