const Favorito = require('../models/Favorito');

const favoritoController = {
  async adicionar(req, res) {
    try {
      const { pacote_id } = req.body;
      if (!pacote_id) return res.status(400).json({ error: 'pacote_id obrigatório' });
      await Favorito.adicionar(req.userId, pacote_id);
      res.json({ message: 'Pacote favoritado com sucesso' });
    } catch (error) {
      console.error('Erro ao favoritar pacote:', error);
      res.status(500).json({ error: 'Erro ao favoritar pacote' });
    }
  },
  async remover(req, res) {
    try {
      const { pacote_id } = req.body;
      if (!pacote_id) return res.status(400).json({ error: 'pacote_id obrigatório' });
      await Favorito.remover(req.userId, pacote_id);
      res.json({ message: 'Pacote removido dos favoritos' });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      res.status(500).json({ error: 'Erro ao remover favorito' });
    }
  },
  async listar(req, res) {
    try {
      const favoritos = await Favorito.listarPorUsuario(req.userId);
      res.json({ total: favoritos.length, favoritos });
    } catch (error) {
      console.error('Erro ao listar favoritos:', error);
      res.status(500).json({ error: 'Erro ao listar favoritos' });
    }
  }
};

module.exports = favoritoController;
