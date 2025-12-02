const amadeusService = require('../services/amadeusService');

const cotacaoController = {
  async cotarPacote(req, res) {
    try {
      const { origem, destino, dataIda, dataVolta } = req.query;
      let adultos = req.query.adultos || req.query.adults || 1;
      console.log('[COTACAO] Parâmetros recebidos:', { origem, destino, dataIda, dataVolta, adultos });
      if (!origem || !destino || !dataIda) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: origem, destino, dataIda' });
      }
      try {
        const amadeusData = await amadeusService.cotarVoo({ origem, destino, dataIda, dataVolta, adultos });
        let cotacao = null;
        if (amadeusData && amadeusData.data && amadeusData.data.length > 0) {
          const voo = amadeusData.data[0];
          const pacote_id = `${voo.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || origem}-${voo.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode || destino}-${Date.now()}`;
          const COTACAO_EUR_BRL = 6.0;
          const precoEuro = parseFloat(voo.price?.total || '0');
          const precoReal = (voo.price?.currency === 'EUR') ? (precoEuro * COTACAO_EUR_BRL) : precoEuro;
          const preco_milhas = Math.round(precoReal * 100);
          cotacao = {
            pacote_id,
            preco_dinheiro: precoReal.toFixed(2),
            preco_milhas,
            moeda: 'BRL',
            origem: voo.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || origem,
            destino: voo.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode || destino,
            data_ida: voo.itineraries?.[0]?.segments?.[0]?.departure?.at || dataIda,
            data_volta: dataVolta || null,
            companhia: voo.itineraries?.[0]?.segments?.[0]?.carrierCode || null,
            duracao: voo.itineraries?.[0]?.duration || null,
            detalhes: voo,
          };
        }
        res.json({ cotacao });
      } catch (error) {
        // Tratamento de erros Amadeus
        let msg = 'Erro ao consultar cotação Amadeus';
        let code = 500;
        let details = error.response?.data || error.message;
        if (details?.errors && Array.isArray(details.errors)) {
          const err = details.errors[0];
          if (err.code === 477 && err.detail?.includes('format')) {
            msg = 'Formato de data inválido. Use datas no formato DD/MM/AAAA ou YYYY-MM-DD.';
            code = 400;
          } else if (err.code === 9880 || (err.detail && err.detail.toLowerCase().includes('too far in the future'))) {
            msg = 'A data escolhida está muito distante no futuro. Tente datas mais próximas!';
            code = 400;
          } else if (err.detail) {
            msg = err.detail;
            code = 400;
          }
        }
        console.error('Erro ao consultar cotação Amadeus:', details);
        res.status(code).json({ error: msg, details });
      }
    } catch (error) {
      console.error('Erro inesperado ao consultar cotação:', error);
      res.status(500).json({ error: 'Erro inesperado ao consultar cotação', details: error.message });
    }
  }
};

module.exports = cotacaoController;
