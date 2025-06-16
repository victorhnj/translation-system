import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { enviarParaFila } from '../services/queueService.js';

export async function criarRequisicao(req, res) {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Texto e idioma de destino são obrigatórios.' });
  }

  const requestId = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO translations (requestId, text, targetLanguage, status)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(requestId, text, targetLanguage, 'queued');

  await enviarParaFila({ requestId, text, targetLanguage });

  res.status(202).json({ requestId, status: 'queued' });
}

export async function consultarRequisicao(req, res) {
  const { requestId } = req.params;
  const stmt = db.prepare(`SELECT * FROM translations WHERE requestId = ?`);
  const row = stmt.get(requestId);

  if (!row) {
    return res.status(404).json({ error: 'Requisição não encontrada.' });
  }

  res.json(row);
}
