import amqp from 'amqplib';
import db from '../db/database.js';
import { traduzirComGemini } from './geminiService.js';

const QUEUE = 'translation_queue';

export async function iniciarFila() {
  try {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    console.log('[Worker] Aguardando mensagens...');

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      try {
        const { requestId, text, targetLanguage } = JSON.parse(msg.content.toString());

        // Atualiza status para "processing"
        db.prepare(`
          UPDATE translations
          SET status = 'processing', updatedAt = CURRENT_TIMESTAMP
          WHERE requestId = ?
        `).run(requestId);

        // Traduz o texto usando Gemini
        const traducao = await traduzirComGemini(text, targetLanguage);

        // Atualiza o banco com a tradução
        db.prepare(`
          UPDATE translations
          SET status = 'completed', translatedText = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE requestId = ?
        `).run(traducao, requestId);

        console.log(`[OK] Tradução concluída para ${requestId}`);
      } catch (err) {
        console.error('[Erro] Falha na tradução:', err.message);

        // Atualiza como erro
        db.prepare(`
          UPDATE translations
          SET status = 'failed', updatedAt = CURRENT_TIMESTAMP
          WHERE requestId = ?
        `).run(JSON.parse(msg.content.toString()).requestId);
      }

      channel.ack(msg);
    }, { noAck: false });

  } catch (error) {
    console.error('[Erro] Falha ao conectar na fila RabbitMQ:', error.message);
    process.exit(1);
  }
}
