-- Tabela de comentários/avaliações de pacotes
CREATE TABLE IF NOT EXISTS comentarios (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pacote_id INTEGER NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
  nota INTEGER CHECK (nota >= 1 AND nota <= 5),
  texto TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de favoritos (usuário x pacote)
CREATE TABLE IF NOT EXISTS favoritos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pacote_id INTEGER NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, pacote_id)
);
-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS pacotes CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TYPE IF EXISTS perfil_tipo CASCADE;
DROP TYPE IF EXISTS auth_tipo CASCADE;

-- Enum para tipo de perfil
CREATE TYPE perfil_tipo AS ENUM ('usuario', 'agente');

-- Enum para tipo de autenticação
CREATE TYPE auth_tipo AS ENUM ('local', 'google');

-- Tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255),
  perfil perfil_tipo DEFAULT 'usuario',
  auth_provider auth_tipo DEFAULT 'local',
  google_id VARCHAR(255) UNIQUE,
  saldo_dinheiro DECIMAL(10, 2) DEFAULT 0.00,
  saldo_milhas INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de refresh tokens
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT false
);

CREATE TABLE pacotes (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  destino VARCHAR(255) NOT NULL,
  data_ida DATE NOT NULL,
  data_volta DATE NOT NULL,
  preco_dinheiro DECIMAL(10, 2) NOT NULL,
  preco_milhas INTEGER NOT NULL,
  vagas_totais INTEGER NOT NULL,
  vagas_disponiveis INTEGER NOT NULL,
  imagem_url VARCHAR(500),
  imagens TEXT[], -- array de URLs de imagens
  hotel VARCHAR(255),
  translado VARCHAR(255),
  categoria VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  agente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de reservas
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pacote_id INTEGER NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
  forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('dinheiro', 'milhas', 'misto')),
  valor_pago DECIMAL(10, 2),
  milhas_utilizadas INTEGER,
  milhas_geradas INTEGER DEFAULT 0,
  cotacao_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);
CREATE INDEX idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_pacotes_destino ON pacotes(destino);
CREATE INDEX idx_pacotes_categoria ON pacotes(categoria);
CREATE INDEX idx_pacotes_data_ida ON pacotes(data_ida);
CREATE INDEX idx_pacotes_ativo ON pacotes(ativo);
CREATE INDEX idx_pacotes_agente ON pacotes(agente_id);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_pacote ON reservas(pacote_id);
CREATE INDEX idx_reservas_status ON reservas(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE
  ON usuarios FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em pacotes
CREATE TRIGGER update_pacotes_updated_at BEFORE UPDATE
  ON pacotes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em reservas
CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE
  ON reservas FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Tabela de extrato de movimentações (dinheiro e milhas)
CREATE TABLE IF NOT EXISTS extrato (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL, -- deposito, compra, promocao, cancelamento, etc
  valor DECIMAL(12,2) DEFAULT 0.00, -- valor em dinheiro (positivo ou negativo)
  descricao TEXT,
  saldo_antes DECIMAL(12,2),
  saldo_depois DECIMAL(12,2),
  milhas_antes INTEGER,
  milhas_depois INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
