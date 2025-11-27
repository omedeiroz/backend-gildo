const pool = require('../config/database');

class Favorito {
  static async adicionar(usuario_id, pacote_id) {
    const query = `INSERT INTO favoritos (usuario_id, pacote_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`;
    const result = await pool.query(query, [usuario_id, pacote_id]);
    return result.rows[0];
  }

  static async remover(usuario_id, pacote_id) {
    const query = `DELETE FROM favoritos WHERE usuario_id = $1 AND pacote_id = $2`;
    await pool.query(query, [usuario_id, pacote_id]);
  }

  static async listarPorUsuario(usuario_id) {
    const query = `
      SELECT f.*, p.* FROM favoritos f
      JOIN pacotes p ON f.pacote_id = p.id
      WHERE f.usuario_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [usuario_id]);
    return result.rows;
  }
}

module.exports = Favorito;
