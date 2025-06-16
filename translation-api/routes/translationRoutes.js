import express from 'express';
import { criarRequisicao, consultarRequisicao } from '../controllers/translationController.js';

const router = express.Router();

router.post('/', criarRequisicao);
router.get('/:requestId', consultarRequisicao);

export default router;
