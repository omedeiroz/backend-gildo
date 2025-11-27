const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/adicionar', comentarioController.adicionar);
router.get('/:pacote_id', comentarioController.listar);

module.exports = router;
