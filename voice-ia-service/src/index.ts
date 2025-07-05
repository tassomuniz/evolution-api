import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupSocket } from './socket';
import { connectionManager } from './connection-manager';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Adiciona o middleware para parsear o corpo da requisição como JSON

app.get('/health', (_req, res) => res.send('OK'));

// Endpoint para iniciar uma chamada de saída
app.post('/call', (req, res) => {
  const { number } = req.body;
  if (!number) {
    return res.status(400).send({ error: 'O número de telefone é obrigatório.' });
  }
  try {
    connectionManager.initiateOutgoingCall(number);
    res.send({ message: `Iniciando chamada para ${number}` });
  } catch (err: any) {
    res.status(500).send({ error: err.message });
  }
});

const server = createServer(app);
setupSocket(server);

const port = parseInt(process.env.PORT || '4000', 10);
console.log(`[App] Tentando iniciar o serviço Voice-IA na porta ${port}...`);
server.listen(port, () => console.log(`[App] Voice-IA service running on port ${port}`));
