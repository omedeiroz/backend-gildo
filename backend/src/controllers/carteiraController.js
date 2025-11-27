const User = require('../models/User');
const Extrato = require('../models/Extrato');

const carteiraController = {
  async depositar(req, res) {
    try {
      const { valor } = req.body;
      if (!valor || isNaN(valor) || valor <= 0) {
        return res.status(400).json({ error: 'Valor de depósito inválido' });
      }
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      const saldoAntes = parseFloat(user.saldo_dinheiro);
      const saldoDepois = saldoAntes + parseFloat(valor);
      await User.updateSaldos(req.userId, saldoDepois, user.saldo_milhas);
      await Extrato.registrar({
        usuario_id: req.userId,
        tipo: 'deposito',
        valor,
        descricao: 'Depósito em dinheiro',
        saldo_antes: saldoAntes,
        saldo_depois: saldoDepois,
        milhas_antes: user.saldo_milhas,
        milhas_depois: user.saldo_milhas
      });
      res.json({ message: 'Depósito realizado com sucesso', saldo: saldoDepois });
    } catch (error) {
      console.error('Erro ao depositar:', error);
      res.status(500).json({ error: 'Erro ao depositar dinheiro' });
    }
  },

  async extrato(req, res) {
    try {
      const extrato = await Extrato.listarPorUsuario(req.userId);
      res.json({ extrato });
    } catch (error) {
      console.error('Erro ao consultar extrato:', error);
      res.status(500).json({ error: 'Erro ao consultar extrato' });
    }
  },

  async promocao(req, res) {
    try {
      const { milhas, descricao } = req.body;
      if (!milhas || isNaN(milhas) || milhas <= 0) {
        return res.status(400).json({ error: 'Quantidade de milhas inválida' });
      }
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      const milhasAntes = user.saldo_milhas;
      const milhasDepois = milhasAntes + parseInt(milhas);
      await User.updateSaldos(req.userId, user.saldo_dinheiro, milhasDepois);
      await Extrato.registrar({
        usuario_id: req.userId,
        tipo: 'promocao',
        valor: 0,
        descricao: descricao || `Promoção de milhas (+${milhas})`,
        saldo_antes: user.saldo_dinheiro,
        saldo_depois: user.saldo_dinheiro,
        milhas_antes: milhasAntes,
        milhas_depois: milhasDepois
      });
      res.json({ message: 'Milhas promocionais creditadas com sucesso', saldo_milhas: milhasDepois });
    } catch (error) {
      console.error('Erro ao creditar milhas promocionais:', error);
      res.status(500).json({ error: 'Erro ao creditar milhas promocionais' });
    }
  }
};

module.exports = carteiraController;
