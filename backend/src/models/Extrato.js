const pool = require('../config/database');

class Extrato {
  static async registrar({ usuario_id, tipo, valor, descricao, saldo_antes, saldo_depois, milhas_antes, milhas_depois }) {
    const query = `
      INSERT INTO extrato (usuario_id, tipo, valor, descricao, saldo_antes, saldo_depois, milhas_antes, milhas_depois)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [usuario_id, tipo, valor, descricao, saldo_antes, saldo_depois, milhas_antes, milhas_depois]);
    return result.rows[0];
  }

  static async listarPorUsuario(usuario_id) {
    const query = 'SELECT * FROM extrato WHERE usuario_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [usuario_id]);
    return result.rows;
  }
}

module.exports = Extrato;
