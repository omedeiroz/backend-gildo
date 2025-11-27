const pool = require('../config/database');

class Comentario {
  static async adicionar({ usuario_id, pacote_id, nota, texto }) {
    const query = `INSERT INTO comentarios (usuario_id, pacote_id, nota, texto) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await pool.query(query, [usuario_id, pacote_id, nota, texto]);
    return result.rows[0];
  }

  static async listarPorPacote(pacote_id) {
    const query = `
      SELECT c.*, u.nome as usuario_nome FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.pacote_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [pacote_id]);
    return result.rows;
  }
}

module.exports = Comentario;
