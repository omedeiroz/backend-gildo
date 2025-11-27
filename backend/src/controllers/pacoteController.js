const Pacote = require('../models/Pacote');

const { cotarPacote } = require('../services/cotacaoService');

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
      // Para cada pacote, buscar cotação dinâmica apenas para o preço
      const pacotesComCotacao = await Promise.all(
        pacotes.map(async (p) => {
          const cotacao = await cotarPacote({
            destino: p.destino,
            data_ida: p.data_ida,
            data_volta: p.data_volta,
            hotel: p.hotel
          });
          return {
            ...p,
            preco_dinheiro: cotacao.preco_dinheiro,
            preco_milhas: cotacao.preco_milhas,
            moeda: cotacao.moeda,
            milhas: cotacao.milhas,
            desconto_percentual: cotacao.desconto_percentual,
            motivo_desconto: cotacao.motivo_desconto
          };
        })
      );
      res.json({
        total: pacotesComCotacao.length,
        pacotes: pacotesComCotacao
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
        vagas_totais,
        imagem_url,
        imagens,
        hotel,
        translado,
        categoria
      } = req.body;

      if (!titulo || !destino || !data_ida || !data_volta || !vagas_totais) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      // Se descricao ou translado não vierem, garantir string vazia
      const descFinal = (descricao === undefined || descricao === null) ? '' : descricao;
      const transladoFinal = (translado === undefined || translado === null) ? '' : translado;

      // Validação dos campos extras (opcional)
      if (imagens && !Array.isArray(imagens)) {
        return res.status(400).json({ error: 'O campo imagens deve ser um array de URLs' });
      }

      // Buscar cotação dinâmica antes de salvar
      let preco_dinheiro = 0;
      let preco_milhas = 0;
      try {
        const cotacao = await cotarPacote({
          destino,
          data_ida,
          data_volta,
          hotel
        });
        preco_dinheiro = cotacao.preco_dinheiro;
        preco_milhas = cotacao.preco_milhas;
      } catch (err) {
        console.error('Erro ao buscar cotação dinâmica:', err);
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
      const pacote = await Pacote.findById(id);

      if (!pacote) {
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      if (req.userPerfil !== 'agente' || pacote.agente_id !== req.userId) {
        return res.status(403).json({ error: 'Sem permissão para editar este pacote' });
      }

      // Validação dos campos extras (opcional)
      if (req.body.imagens && !Array.isArray(req.body.imagens)) {
        return res.status(400).json({ error: 'O campo imagens deve ser um array de URLs' });
      }

      const updated = await Pacote.update(id, req.body);

      res.json({
        message: 'Pacote atualizado com sucesso',
        pacote: updated
      });
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      res.status(500).json({ error: 'Erro ao atualizar pacote' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const pacote = await Pacote.findById(id);

      if (!pacote) {
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      if (req.userPerfil !== 'agente' || pacote.agente_id !== req.userId) {
        return res.status(403).json({ error: 'Sem permissão para deletar este pacote' });
      }

      await Pacote.delete(id);

      res.json({ message: 'Pacote deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar pacote:', error);
      res.status(500).json({ error: 'Erro ao deletar pacote' });
    }
  }
}

module.exports = new PacoteController();