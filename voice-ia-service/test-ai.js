// Test script para Voice-IA Service
// Instale antes: npm install socket.io-client

const { io } = require('socket.io-client');

const TOKEN = 'mysecrettoken123';
const URL = 'http://127.0.0.1:4000';

const socket = io(URL, {
  transports: ['websocket'],
  path: `/websocket`, // Changed to fixed path
});

socket.on('connect', () => {
  console.log('Conectado ao Voice-IA');
  socket.emit('init');

  // Emula envio de um chunk de áudio
  const dummy = Buffer.alloc(1600, 128); // 1.6KB de dados exemplares
  console.log('Enviando chunk de áudio...');
  socket.emit('audio:stream', dummy);

  // Finaliza o stream
  console.log('Enviando evento audio:end');
  socket.emit('audio:end');
});

socket.on('audio:response', (chunk) => {
  console.log('Recebido chunk de resposta (bytes):', chunk.length);
});

socket.on('disconnect', () => {
  console.log('Desconectado');
});

// Adiciona um timeout para garantir que o script não fique travado indefinidamente
setTimeout(() => {
  console.log('Timeout atingido. Desconectando e encerrando o processo.');
  socket.disconnect();
  process.exit(0);
}, 10000); // 10 segundos

socket.on('error', (err) => {
  console.error('Erro no Socket:', err);
});
