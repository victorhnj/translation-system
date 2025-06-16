import amqp from 'amqplib';

const QUEUE = 'translation_queue';

let channel;

async function conectarFila() {
  const connection = await amqp.connect('amqp://rabbitmq');
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE);
}

export async function enviarParaFila(payload) {
  if (!channel) await conectarFila();
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)));
}
