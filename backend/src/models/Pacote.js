const pool = require('../config/database');

class Pacote {
    static async updateVagas(id, delta) {
      const query = `
        UPDATE pacotes
        SET vagas_disponiveis = vagas_disponiveis + $1
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [delta, id]);
      return result.rows[0];
    }
  static async create(data) {
    const {
      titulo,
      descricao = '',
      destino,
      data_ida,
      data_volta,
      preco_dinheiro,
      preco_milhas,
      vagas_totais,
      imagem_url = null,
      imagens = null,
      hotel = null,
      translado = '',
      categoria = null,
      agente_id = null
    } = data;

    const query = `
      INSERT INTO pacotes (
        titulo, descricao, destino, data_ida, data_volta,
        preco_dinheiro, preco_milhas, vagas_totais, vagas_disponiveis,
        imagem_url, imagens, hotel, translado, categoria, agente_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      titulo,
      descricao,
      destino,
      data_ida,
      data_volta,
      preco_dinheiro,
      preco_milhas,
      vagas_totais,
      imagem_url,
      imagens,
      hotel,
      translado,
      categoria,
      agente_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM pacotes WHERE ativo = true';
    const values = [];
    let paramCount = 1;

    if (filters.destino) {
      query += ` AND destino ILIKE $${paramCount}`;
      values.push(`%${filters.destino}%`);
      paramCount++;
    }
    if (filters.categoria) {
      query += ` AND categoria = $${paramCount}`;
      values.push(filters.categoria);
      paramCount++;
    }
    if (filters.data_ida) {
      query += ` AND data_ida >= $${paramCount}`;
      values.push(filters.data_ida);
      paramCount++;
    }
    if (filters.data_volta) {
      query += ` AND data_volta <= $${paramCount}`;
      values.push(filters.data_volta);
      paramCount++;
    }
    if (filters.preco_min) {
      query += ` AND preco_dinheiro >= $${paramCount}`;
      values.push(filters.preco_min);
      paramCount++;
    }
    if (filters.preco_max) {
      query += ` AND preco_dinheiro <= $${paramCount}`;
      values.push(filters.preco_max);
      paramCount++;
    }
    if (filters.hotel) {
      query += ` AND hotel ILIKE $${paramCount}`;
      values.push(`%${filters.hotel}%`);
      paramCount++;
    }
    if (filters.translado) {
      query += ` AND translado ILIKE $${paramCount}`;
      values.push(`%${filters.translado}%`);
      paramCount++;
    }
    if (filters.vagas_disponiveis) {
      query += ` AND vagas_disponiveis > 0`;
    }
    query += ' ORDER BY data_ida ASC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM pacotes WHERE id = $1 AND ativo = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE pacotes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'UPDATE pacotes SET ativo = false WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Pacote;