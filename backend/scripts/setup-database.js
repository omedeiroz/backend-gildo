const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL (Neon)');

    console.log('🔄 Criando tabelas...');
    
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Arquivo schema.sql não encontrado em: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);
    console.log('✅ Tabelas criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Conexão encerrada');
  }
}

setupDatabase();