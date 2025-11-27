const axios = require('axios');


async function cotarPacote({ destino, data_ida, data_volta, hotel }) {

  let preco_dinheiro = Math.floor(Math.random() * 2000) + 1000; 
  let preco_milhas = Math.floor(Math.random() * 40000) + 20000; 
  let desconto = 0;
  let motivo_desconto = null;

  // Desconto de 10% para reservas com mais de 30 dias de antecedência
  if (data_ida) {
    const hoje = new Date();
    const ida = new Date(data_ida);
    const diffDias = Math.ceil((ida - hoje) / (1000 * 60 * 60 * 24));
    if (diffDias > 30) {
      desconto = 0.1;
      motivo_desconto = 'Desconto para reserva antecipada (>30 dias)';
    }
  }
  if (desconto > 0) {
    preco_dinheiro = Math.round(preco_dinheiro * (1 - desconto));
    preco_milhas = Math.round(preco_milhas * (1 - desconto));
  }
  return {
    preco_dinheiro,
    preco_milhas,
    moeda: 'BRL',
    milhas: 'LATAM',
    desconto_percentual: desconto > 0 ? desconto * 100 : 0,
    motivo_desconto,
    detalhes: {
      hotel,
      destino,
      data_ida,
      data_volta
    }
  };
}

module.exports = { cotarPacote };
