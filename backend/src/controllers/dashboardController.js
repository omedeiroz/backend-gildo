const Reserva = require('../models/Reserva');
const User = require('../models/User');

const dashboardController = {
  async resumoUsuario(req, res) {
    try {
      const userId = req.userId;
      const reservas = await Reserva.findByUserId(userId);
      let totalDinheiro = 0;
      let totalMilhas = 0;
      let milhasAcumuladas = 0;
      let pacotes = 0;
      reservas.forEach(r => {
        if (r.status === 'confirmada') {
          totalDinheiro += Number(r.valor_pago || 0);
          totalMilhas += Number(r.milhas_utilizadas || 0);
          milhasAcumuladas += Number(r.milhas_geradas || 0);
          pacotes++;
        }
      });
      const user = await User.findById(userId);
      res.json({
        total_gasto_dinheiro: totalDinheiro,
        total_gasto_milhas: totalMilhas,
        milhas_acumuladas: milhasAcumuladas,
        saldo_dinheiro: user.saldo_dinheiro,
        saldo_milhas: user.saldo_milhas,
        total_pacotes: pacotes
      });
    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.status(500).json({ error: 'Erro ao gerar dashboard' });
    }
  }
};

module.exports = dashboardController;
