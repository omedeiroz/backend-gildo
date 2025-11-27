
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

console.log('🔍 Carregando rotas de cotação...');
app.use('/api/cotacao', require('./routes/cotacao'));
console.log('✅ Rotas de cotação carregadas!');

console.log('🔍 Carregando rotas de comentários...');
app.use('/api/comentarios', require('./routes/comentarios'));
console.log('✅ Rotas de comentários carregadas!');

console.log('🔍 Carregando rotas de favoritos...');
app.use('/api/favoritos', require('./routes/favoritos'));
console.log('✅ Rotas de favoritos carregadas!');

console.log('🔍 Carregando rotas de dashboard...');
app.use('/api/dashboard', require('./routes/dashboard'));
console.log('✅ Rotas de dashboard carregadas!');

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Pacotes de Viagem rodando!',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/auth', require('./routes/auth'));

console.log('🔍 Carregando rotas de pacotes...');
app.use('/api/pacotes', require('./routes/pacotes'));
console.log('✅ Rotas de pacotes carregadas!');



console.log('🔍 Carregando rotas de reservas...');
app.use('/api/reservas', require('./routes/reservas'));
console.log('✅ Rotas de reservas carregadas!');

console.log('🔍 Carregando rotas de carteira...');
app.use('/api/carteira', require('./routes/carteira'));
console.log('✅ Rotas de carteira carregadas!');


app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
});

module.exports = app;
