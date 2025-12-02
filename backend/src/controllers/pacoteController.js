const Pacote = require('../models/Pacote');

class PacoteController {
  async index(req, res) {
    try {
      const filters = {
        destino: req.query.destino,
        categoria: req.query.categoria,
        data_ida: req.query.data_ida,
        data_volta: req.query.data_volta,
        preco_min: req.query.preco_min,
        preco_max: req.query.preco_max,
        hotel: req.query.hotel,
        translado: req.query.translado,
        vagas_disponiveis: req.query.vagas_disponiveis === 'true'
      };

      const pacotes = await Pacote.findAll(filters);

      res.json({
        total: pacotes.length,
        pacotes
      });
    } catch (error) {
      console.error('Erro ao listar pacotes:', error);
      res.status(500).json({ error: 'Erro ao listar pacotes' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const pacote = await Pacote.findById(id);

      if (!pacote) {
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      res.json(pacote);
    } catch (error) {
      console.error('Erro ao buscar pacote:', error);
      res.status(500).json({ error: 'Erro ao buscar pacote' });
    }
  }

  async create(req, res) {
    try {
      const {
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
        categoria
      } = req.body;


      // Permitir descricao e translado em branco
      if (!titulo || !destino || !data_ida || !data_volta || !preco_dinheiro || !preco_milhas || !vagas_totais) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      // Se descricao ou translado não vierem, garantir string vazia
      const descFinal = (descricao === undefined || descricao === null) ? '' : descricao;
      const transladoFinal = (translado === undefined || translado === null) ? '' : translado;

      // Validação dos campos extras (opcional)
      if (imagens && !Array.isArray(imagens)) {
        return res.status(400).json({ error: 'O campo imagens deve ser um array de URLs' });
      }

      const pacote = await Pacote.create({
        titulo,
        descricao: descFinal,
        destino,
        data_ida,
        data_volta,
        preco_dinheiro,
        preco_milhas,
        vagas_totais,
        imagem_url,
        imagens,
        hotel,
        translado: transladoFinal,
        categoria,
        agente_id: req.userId
      });

      res.status(201).json({
        message: 'Pacote criado com sucesso',
        pacote
      });
    } catch (error) {
      console.error('Erro ao criar pacote:', error);
      res.status(500).json({ error: 'Erro ao criar pacote' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      console.log('[UPDATE PACOTE] Usuário:', req.userId, '| Perfil:', req.userPerfil, '| Pacote ID:', id);
      const pacote = await Pacote.findById(id);

      if (!pacote) {
        console.log('[UPDATE PACOTE] Pacote não encontrado:', id);
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      console.log('[UPDATE PACOTE] Dono do pacote:', pacote.agente_id);

      if (req.userPerfil !== 'agente') {
        console.log('[UPDATE PACOTE] Permissão negada. userPerfil:', req.userPerfil, '| userId:', req.userId, '| agente_id do pacote:', pacote.agente_id);
        return res.status(403).json({ error: 'Sem permissão para editar este pacote', debug: { userPerfil: req.userPerfil, userId: req.userId, agente_id: pacote.agente_id } });
      }

      // Validação dos campos extras (opcional)
      if (req.body.imagens && !Array.isArray(req.body.imagens)) {
        return res.status(400).json({ error: 'O campo imagens deve ser um array de URLs' });
      }

      const updated = await Pacote.update(id, req.body);

      console.log('[UPDATE PACOTE] Pacote atualizado com sucesso:', id);
      res.json({
        message: 'Pacote atualizado com sucesso',
        pacote: updated
      });
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      res.status(500).json({ error: 'Erro ao atualizar pacote', debug: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      console.log('[DELETE PACOTE] Usuário:', req.userId, '| Perfil:', req.userPerfil, '| Pacote ID:', id);
      const pacote = await Pacote.findById(id);

      if (!pacote) {
        console.log('[DELETE PACOTE] Pacote não encontrado:', id);
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      console.log('[DELETE PACOTE] Dono do pacote:', pacote.agente_id);

      if (req.userPerfil !== 'agente') {
        console.log('[DELETE PACOTE] Permissão negada. userPerfil:', req.userPerfil, '| userId:', req.userId, '| agente_id do pacote:', pacote.agente_id);
        return res.status(403).json({ error: 'Sem permissão para deletar este pacote', debug: { userPerfil: req.userPerfil, userId: req.userId, agente_id: pacote.agente_id } });
      }

      await Pacote.delete(id);

      console.log('[DELETE PACOTE] Pacote deletado com sucesso:', id);
      res.json({ message: 'Pacote deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar pacote:', error);
      res.status(500).json({ error: 'Erro ao deletar pacote', debug: error.message });
    }
  }
}

module.exports = new PacoteController();