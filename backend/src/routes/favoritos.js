const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/adicionar', favoritoController.adicionar);
router.post('/remover', favoritoController.remover);
router.get('/', favoritoController.listar);

module.exports = router;
