const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ nome, email, senha, perfil = 'usuario', authProvider = 'local', googleId = null }) {
    const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;
    
    const query = `
      INSERT INTO usuarios (nome, email, senha, perfil, auth_provider, google_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome, email, perfil, auth_provider, saldo_dinheiro, saldo_milhas, created_at
    `;
    
    const values = [nome, email, senhaHash, perfil, authProvider, googleId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1 AND ativo = true';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, nome, email, perfil, auth_provider, saldo_dinheiro, saldo_milhas, created_at FROM usuarios WHERE id = $1 AND ativo = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByGoogleId(googleId) {
    const query = 'SELECT * FROM usuarios WHERE google_id = $1 AND ativo = true';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  }

  static async comparePassword(senha, senhaHash) {
    return await bcrypt.compare(senha, senhaHash);
  }

  static async updateSaldos(userId, saldoDinheiro, saldoMilhas) {
    const query = `
      UPDATE usuarios 
      SET saldo_dinheiro = $1, saldo_milhas = $2 
      WHERE id = $3
      RETURNING id, saldo_dinheiro, saldo_milhas
    `;
    const result = await pool.query(query, [saldoDinheiro, saldoMilhas, userId]);
    return result.rows[0];
  }
}

module.exports = User;
