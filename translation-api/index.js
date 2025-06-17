import express from 'express';
import amqp from 'amqplib';
import db from './db/database.js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const QUEUE = process.env.QUEUE_NAME || 'translation_queue';

app.use(express.json());

let channel;

// Conexão com RabbitMQ
async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
    console.log('[API] Conectado ao RabbitMQ');
  } catch (error) {
    console.error('[API] Erro ao conectar ao RabbitMQ:', error.message);
    process.exit(1);
  }
}

connectToRabbitMQ();

// Endpoint para solicitar tradução
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: text, targetLanguage' });
  }

  const requestId = randomUUID();

  try {
    // Inserir no banco
    db.prepare(`
      INSERT INTO translations (requestId, text, targetLanguage, status, createdAt, updatedAt)
      VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(requestId, text, targetLanguage);

    // Publicar na fila
    const payload = { requestId, text, targetLanguage };
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)));

    console.log(`[API] Tradução solicitada: ${requestId}`);
    return res.status(202).json({ requestId });
  } catch (error) {
    console.error('[API] Erro ao processar tradução:', error.message);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Endpoint para verificar status
app.get('/translate/:requestId', (req, res) => {
  const { requestId } = req.params;

  try {
    const row = db.prepare('SELECT * FROM translations WHERE requestId = ?').get(requestId);

    if (!row) {
      return res.status(404).json({ error: 'requestId não encontrado' });
    }

    return res.json(row);
  } catch (error) {
    console.error('[API] Erro ao buscar tradução:', error.message);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`[API] Servidor rodando em http://localhost:${PORT}`);
});
