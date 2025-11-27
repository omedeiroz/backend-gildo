const express = require('express');
const router = express.Router();
const cotacaoController = require('../controllers/cotacaoController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

// GET /api/cotacao?origem=GRU&destino=JFK&dataIda=2025-12-01&dataVolta=2025-12-10&adultos=1
router.get('/', cotacaoController.cotarPacote);

module.exports = router;
