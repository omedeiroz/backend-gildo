const express = require('express');
const router = express.Router();
const pacoteController = require('../controllers/pacoteController');
const { authMiddleware, isAgente } = require('../middlewares/auth');

router.get('/', pacoteController.index);
router.get('/:id', pacoteController.show);
router.post('/', authMiddleware, isAgente, pacoteController.create);
router.put('/:id', authMiddleware, isAgente, pacoteController.update);
router.delete('/:id', authMiddleware, isAgente, pacoteController.delete);

module.exports = router;