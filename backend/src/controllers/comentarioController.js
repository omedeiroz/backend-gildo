const Comentario = require('../models/Comentario');

const comentarioController = {
  async adicionar(req, res) {
    try {
      const { pacote_id, nota, texto } = req.body;
      if (!pacote_id || !nota) return res.status(400).json({ error: 'pacote_id e nota são obrigatórios' });
      if (nota < 1 || nota > 5) return res.status(400).json({ error: 'Nota deve ser entre 1 e 5' });
      const comentario = await Comentario.adicionar({ usuario_id: req.userId, pacote_id, nota, texto });
      res.status(201).json({ message: 'Comentário adicionado', comentario });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      res.status(500).json({ error: 'Erro ao adicionar comentário' });
    }
  },
  async listar(req, res) {
    try {
      const { pacote_id } = req.params;
      if (!pacote_id) return res.status(400).json({ error: 'pacote_id obrigatório' });
      const comentarios = await Comentario.listarPorPacote(pacote_id);
      res.json({ total: comentarios.length, comentarios });
    } catch (error) {
      console.error('Erro ao listar comentários:', error);
      res.status(500).json({ error: 'Erro ao listar comentários' });
    }
  }
};

module.exports = comentarioController;
