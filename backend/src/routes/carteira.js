const express = require('express');
const router = express.Router();
const carteiraController = require('../controllers/carteiraController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/depositar', carteiraController.depositar);

router.get('/extrato', carteiraController.extrato);
router.post('/promocao', carteiraController.promocao);

module.exports = router;
