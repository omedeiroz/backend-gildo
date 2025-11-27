# API de Pacotes de Viagem

## Tecnologias
- Node.js
- Express
- PostgreSQL
- JWT (autenticação) (faltou so o OAUTH porque eu nao faço a materia do gildo)
- dotenv

## Configuração
1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente em um arquivo `.env` (Eu utilizei NEON (banco postgre online), pra facilitar na hora de deployar depois e o Daves testar (o front)):
   ```env
   DATABASE_URL=postgres://usuario:senha@host:porta/database
   PORT=3000
   JWT_SECRET=sua_chave_secreta
   ```
4. Execute o script para criar as tabelas do banco:
   ```bash
   node scripts/setup-database.js
   ```
5. Inicie o servidor:
   ```bash
   npm start
   ```

## Scripts
- `scripts/setup-database.js`: Cria as tabelas no banco de dados a partir do arquivo `src/database/schema.sql`.

## Rotas da API

### Autenticação
- `POST /api/auth/register` — Cadastro de usuário
- `POST /api/auth/login` — Login de usuário
- `POST /api/auth/refresh` — Gera novo token de acesso

### Pacotes
- `GET /api/pacotes` — Lista todos os pacotes
- `GET /api/pacotes/:id` — Detalhes de um pacote
- `POST /api/pacotes` — Cria um novo pacote
- `PUT /api/pacotes/:id` — Atualiza um pacote
- `DELETE /api/pacotes/:id` — Remove um pacote

### Reservas
- `GET /api/reservas` — Lista reservas do usuário
- `POST /api/reservas` — Cria uma nova reserva
- `DELETE /api/reservas/:id` — Cancela uma reserva

### Comentários
- `GET /api/comentarios/:pacoteId` — Lista comentários de um pacote
- `POST /api/comentarios/:pacoteId` — Adiciona comentário a um pacote
- `DELETE /api/comentarios/:id` — Remove um comentário

### Favoritos
- `GET /api/favoritos` — Lista favoritos do usuário
- `POST /api/favoritos/:pacoteId` — Adiciona pacote aos favoritos
- `DELETE /api/favoritos/:pacoteId` — Remove pacote dos favoritos

### Cotação
- `GET /api/cotacao` — Consulta cotação de moedas

### Dashboard
- `GET /api/dashboard` — Dados resumidos do usuário

### Carteira
- `GET /api/carteira` — Consulta saldo da carteira
- `POST /api/carteira/adicionar` — Adiciona saldo
- `POST /api/carteira/retirar` — Retira saldo

### Outros
- `GET /` — Status da API
- `GET /health` — Health check

## Estrutura de Pastas
```
src/
  server.js            # Inicialização do servidor
  config/              # Configurações (ex: database.js)
  controllers/         # Lógica das rotas
  database/            # Schema SQL
  middlewares/         # Middlewares (ex: autenticação)
  models/              # Modelos das entidades
  routes/              # Definição das rotas
  services/            # Serviços externos (ex: cotação)
  utils/               # Utilitários (ex: JWT)
scripts/
  setup-database.js    # Script para setup do banco
```

---
