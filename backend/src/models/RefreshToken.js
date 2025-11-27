const pool = require('../config/database');

class RefreshToken {
  static async create(usuarioId, token, expiresIn) {
    const expiresAt = new Date(Date.now() + expiresIn);
    
    const query = `
      INSERT INTO refresh_tokens (usuario_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, token, expires_at
    `;
    
    const result = await pool.query(query, [usuarioId, token, expiresAt]);
    return result.rows[0];
  }

  static async findByToken(token) {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1 AND revoked = false AND expires_at > NOW()
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async revoke(token) {
    const query = 'UPDATE refresh_tokens SET revoked = true WHERE token = $1';
    await pool.query(query, [token]);
  }

  static async revokeAllByUser(usuarioId) {
    const query = 'UPDATE refresh_tokens SET revoked = true WHERE usuario_id = $1';
    await pool.query(query, [usuarioId]);
  }

  static async deleteExpired() {
    const query = 'DELETE FROM refresh_tokens WHERE expires_at < NOW()';
    await pool.query(query);
  }
}

module.exports = RefreshToken;
