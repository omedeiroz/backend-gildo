const Reserva = require('../models/Reserva');
const Pacote = require('../models/Pacote');
const User = require('../models/User');
const pool = require('../config/database');

class ReservaController {
  async create(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { pacote_id, forma_pagamento, valor_dinheiro, valor_milhas, cotacao_id, origem, destino, dataIda, dataVolta } = req.body;
      const usuario_id = req.userId;

      if (!pacote_id || !forma_pagamento) {
        return res.status(400).json({ error: 'Pacote e forma de pagamento são obrigatórios' });
      }

      if (!['dinheiro', 'milhas', 'misto'].includes(forma_pagamento)) {
        return res.status(400).json({ error: 'Forma de pagamento inválida' });
      }

      const pacote = await Pacote.findById(pacote_id);
      if (!pacote) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      if (pacote.vagas_disponiveis <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Não há vagas disponíveis' });
      }

      const usuario = await User.findById(usuario_id);


      let valor_pago = null;
      let milhas_utilizadas = null;
      let valorDinheiro = 0;
      let valorMilhas = 0;
      let cotacaoInfo = null;

      if (forma_pagamento === 'dinheiro') {
        valorDinheiro = pacote.preco_dinheiro;
        if (parseFloat(usuario.saldo_dinheiro) < valorDinheiro) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            error: 'Saldo insuficiente',
            saldo_atual: usuario.saldo_dinheiro,
            valor_necessario: valorDinheiro
          });
        }
        valor_pago = valorDinheiro;
        milhas_utilizadas = 0;
        await User.updateSaldos(usuario_id, usuario.saldo_dinheiro - valorDinheiro, usuario.saldo_milhas);
      } else if (forma_pagamento === 'milhas') {
        valorMilhas = pacote.preco_milhas;
        if (parseInt(usuario.saldo_milhas) < valorMilhas) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            error: 'Milhas insuficientes',
            milhas_atuais: usuario.saldo_milhas,
            milhas_necessarias: valorMilhas
          });
        }
        valor_pago = 0;
        milhas_utilizadas = valorMilhas;
        await User.updateSaldos(usuario_id, usuario.saldo_dinheiro, usuario.saldo_milhas - valorMilhas);
      } else if (forma_pagamento === 'misto') {
        // Compra mista: precisa dos valores de composição e cotação
        if (!valor_dinheiro || !valor_milhas) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Valores de composição (dinheiro e milhas) são obrigatórios para pagamento misto.' });
        }
        valorDinheiro = parseFloat(valor_dinheiro);
        valorMilhas = parseInt(valor_milhas);
        if (usuario.saldo_dinheiro < valorDinheiro) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Saldo em dinheiro insuficiente', saldo_atual: usuario.saldo_dinheiro, valor_necessario: valorDinheiro });
        }
        if (usuario.saldo_milhas < valorMilhas) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Milhas insuficientes', milhas_atuais: usuario.saldo_milhas, milhas_necessarias: valorMilhas });
        }
        // (Opcional) Validar cotação Amadeus: buscar cotação e conferir se valores batem
        // Exemplo: buscar cotação se origem/destino/dataIda fornecidos
        // (pode ser expandido para buscar cotação real)
        valor_pago = valorDinheiro;
        milhas_utilizadas = valorMilhas;
        await User.updateSaldos(usuario_id, usuario.saldo_dinheiro - valorDinheiro, usuario.saldo_milhas - valorMilhas);
      }


      // Geração de milhas sobre a parte paga em dinheiro (exemplo: 1 real = 1 milha)
      let milhas_geradas = 0;
      if (valor_pago && valor_pago > 0) {
        milhas_geradas = Math.floor(valor_pago); // regra simples: 1 real = 1 milha
        await User.updateSaldos(usuario_id, undefined, (usuario.saldo_milhas - (milhas_utilizadas || 0)) + milhas_geradas);
      }

      // Registrar no extrato
      const Extrato = require('../models/Extrato');
      const saldoAntes = usuario.saldo_dinheiro;
      const saldoDepois = usuario.saldo_dinheiro - (valorDinheiro || 0);
      const milhasAntes = usuario.saldo_milhas;
      const milhasDepois = (usuario.saldo_milhas - (valorMilhas || 0)) + milhas_geradas;
      await Extrato.registrar({
        usuario_id,
        tipo: 'compra',
        valor: valorDinheiro,
        descricao: `Compra de pacote #${pacote_id} (${forma_pagamento})`,
        saldo_antes: saldoAntes,
        saldo_depois: saldoDepois,
        milhas_antes: milhasAntes,
        milhas_depois: milhasDepois
      });

      if (milhas_geradas > 0) {
        await Extrato.registrar({
          usuario_id,
          tipo: 'bonus',
          valor: 0,
          descricao: `Milhas geradas na compra: +${milhas_geradas}`,
          saldo_antes: saldoDepois,
          saldo_depois: saldoDepois,
          milhas_antes: milhasDepois - milhas_geradas,
          milhas_depois: milhasDepois
        });
      }

      const reserva = await Reserva.create({
        usuario_id,
        pacote_id,
        forma_pagamento,
        valor_pago,
        milhas_utilizadas,
        milhas_geradas,
        cotacao_id: cotacao_id || null
      });

      await Pacote.updateVagas(pacote_id, -1);

      await client.query('COMMIT');

      const reservaCompleta = await Reserva.findById(reserva.id);

      res.status(201).json({
        message: 'Reserva criada com sucesso',
        reserva: reservaCompleta
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar reserva:', error);
      res.status(500).json({ error: 'Erro ao criar reserva' });
    } finally {
      client.release();
    }
  }

  async index(req, res) {
    try {
      const filters = {
        status: req.query.status,
        usuario_id: req.query.usuario_id,
        pacote_id: req.query.pacote_id
      };

      const reservas = await Reserva.findAll(filters);

      res.json({
        total: reservas.length,
        reservas
      });
    } catch (error) {
      console.error('Erro ao listar reservas:', error);
      res.status(500).json({ error: 'Erro ao listar reservas' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const reserva = await Reserva.findById(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva não encontrada' });
      }

      if (req.userPerfil !== 'agente' && reserva.usuario_id !== req.userId) {
        return res.status(403).json({ error: 'Sem permissão para visualizar esta reserva' });
      }

      res.json(reserva);
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      res.status(500).json({ error: 'Erro ao buscar reserva' });
    }
  }

  async myReservas(req, res) {
    try {
      const { data_inicio, data_fim, destino, status } = req.query;
      const filtros = { usuario_id: req.userId };
      if (status) filtros.status = status;
      // Filtros de período e destino serão aplicados manualmente após query
      let reservas = await Reserva.findByUserId(req.userId);
      if (data_inicio) {
        reservas = reservas.filter(r => new Date(r.created_at) >= new Date(data_inicio));
      }
      if (data_fim) {
        reservas = reservas.filter(r => new Date(r.created_at) <= new Date(data_fim));
      }
      if (destino) {
        reservas = reservas.filter(r => r.pacote_destino && r.pacote_destino.toLowerCase().includes(destino.toLowerCase()));
      }
      if (status) {
        reservas = reservas.filter(r => r.status === status);
      }
      res.json({
        total: reservas.length,
        reservas
      });
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      res.status(500).json({ error: 'Erro ao buscar reservas' });
    }
  }

  async cancel(req, res) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { id } = req.params;
      const reserva = await Reserva.findById(id);
      if (!reserva) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Reserva não encontrada' });
      }
      if (reserva.usuario_id !== req.userId) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Sem permissão para cancelar esta reserva' });
      }
      if (reserva.status === 'cancelada') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Reserva já está cancelada' });
      }
      // Política: só permite cancelar se status pendente ou confirmada (pode customizar)
      if (!['pendente', 'confirmada'].includes(reserva.status)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Reserva não pode ser cancelada' });
      }
      await Reserva.updateStatus(id, 'cancelada');
      await Pacote.updateVagas(reserva.pacote_id, 1);
      const usuario = await User.findById(reserva.usuario_id);
      // Devolução automática
      let novoSaldoDinheiro = usuario.saldo_dinheiro;
      let novoSaldoMilhas = usuario.saldo_milhas;
      if (reserva.valor_pago && reserva.valor_pago > 0) {
        novoSaldoDinheiro += parseFloat(reserva.valor_pago);
      }
      if (reserva.milhas_utilizadas && reserva.milhas_utilizadas > 0) {
        novoSaldoMilhas += parseInt(reserva.milhas_utilizadas);
      }
      // Remove milhas geradas na compra, se houver
      if (reserva.milhas_geradas && reserva.milhas_geradas > 0) {
        novoSaldoMilhas -= parseInt(reserva.milhas_geradas);
      }
      await User.updateSaldos(reserva.usuario_id, novoSaldoDinheiro, novoSaldoMilhas);
      // Registrar no extrato
      const Extrato = require('../models/Extrato');
      await Extrato.registrar({
        usuario_id: reserva.usuario_id,
        tipo: 'reembolso',
        valor: reserva.valor_pago || 0,
        descricao: `Reembolso por cancelamento da reserva #${id}`,
        saldo_antes: usuario.saldo_dinheiro,
        saldo_depois: novoSaldoDinheiro,
        milhas_antes: usuario.saldo_milhas,
        milhas_depois: novoSaldoMilhas
      });
      res.json({ message: 'Reserva cancelada e valores reembolsados com sucesso' });
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao cancelar reserva:', error);
      res.status(500).json({ error: 'Erro ao cancelar reserva' });
    } finally {
      client.release();
    }
  }

  async confirm(req, res) {
    try {
      const { id } = req.params;
      const reserva = await Reserva.findById(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva não encontrada' });
      }

      if (reserva.status === 'confirmada') {
        return res.status(400).json({ error: 'Reserva já está confirmada' });
      }

      if (reserva.status === 'cancelada') {
        return res.status(400).json({ error: 'Não é possível confirmar uma reserva cancelada' });
      }

      await Reserva.updateStatus(id, 'confirmada');

      res.json({ message: 'Reserva confirmada com sucesso' });

    } catch (error) {
      console.error('Erro ao confirmar reserva:', error);
      res.status(500).json({ error: 'Erro ao confirmar reserva' });
    }
  }
}

module.exports = new ReservaController();