const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { authMiddleware, isAgente } = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/', reservaController.create);
router.get('/minhas', reservaController.myReservas);
router.get('/:id', reservaController.show);
router.post('/:id/cancelar', reservaController.cancel);

router.get('/', isAgente, reservaController.index);
router.post('/:id/confirmar', isAgente, reservaController.confirm);

module.exports = router;