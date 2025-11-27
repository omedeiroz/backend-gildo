const pool = require('../config/database');

class Reserva {
  static async create(data) {
    const { usuario_id, pacote_id, forma_pagamento, valor_pago, milhas_utilizadas, milhas_geradas = 0, cotacao_id = null } = data;

    const query = `
      INSERT INTO reservas (usuario_id, pacote_id, forma_pagamento, valor_pago, milhas_utilizadas, milhas_geradas, cotacao_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendente')
      RETURNING *
    `;

    const values = [usuario_id, pacote_id, forma_pagamento, valor_pago, milhas_utilizadas, milhas_geradas, cotacao_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT r.*, 
             u.nome as usuario_nome, u.email as usuario_email,
             p.titulo as pacote_titulo, p.destino as pacote_destino,
             p.data_ida, p.data_volta
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN pacotes p ON r.pacote_id = p.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT r.*, 
             p.titulo as pacote_titulo, p.destino as pacote_destino,
             p.data_ida, p.data_volta, p.imagem_url
      FROM reservas r
      JOIN pacotes p ON r.pacote_id = p.id
      WHERE r.usuario_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT r.*, 
             u.nome as usuario_nome, u.email as usuario_email,
             p.titulo as pacote_titulo, p.destino as pacote_destino
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN pacotes p ON r.pacote_id = p.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND r.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.usuario_id) {
      query += ` AND r.usuario_id = $${paramCount}`;
      values.push(filters.usuario_id);
      paramCount++;
    }

    if (filters.pacote_id) {
      query += ` AND r.pacote_id = $${paramCount}`;
      values.push(filters.pacote_id);
      paramCount++;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE reservas 
      SET status = $1 
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async countByPacote(pacoteId) {
    const query = `
      SELECT COUNT(*) as total 
      FROM reservas 
      WHERE pacote_id = $1 AND status != 'cancelada'
    `;
    const result = await pool.query(query, [pacoteId]);
    return parseInt(result.rows[0].total);
  }
}

module.exports = Reserva;