const amadeusService = require('../services/amadeusService');

const cotacaoController = {
  async cotarPacote(req, res) {
    try {
      const { origem, destino, dataIda, dataVolta } = req.query;
      // Aceita tanto 'adults' quanto 'adultos' e sempre envia 'adults' para o Amadeus
      let adults = req.query.adults || req.query.adultos || 1;
      if (!origem || !destino || !dataIda) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: origem, destino, dataIda' });
      }
      adults = parseInt(adults) || 1;
      const cotacao = await amadeusService.cotarVoo({ origem, destino, dataIda, dataVolta, adults });
      res.json({ cotacao });
    } catch (error) {
      console.error('Erro ao consultar cotação Amadeus:', error.response?.data || error.message);
      res.status(500).json({ error: 'Erro ao consultar cotação Amadeus', details: error.response?.data || error.message });
    }
  }
};

module.exports = cotacaoController;
