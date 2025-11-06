const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const { ulid } = require('ulid');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

async function insertTestUsers() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Gera o hash da senha uma única vez (reutilizável para todos)
    const passwordHash = await bcrypt.hash('pwd123', 10);
    
    console.log('Iniciando inserção de 2000 usuários...');
    
    // Array para armazenar dados do CSV
    const csvData = [];
    csvData.push('name,email,password'); // Cabeçalho
    
    // Inserir em lotes de 100 para melhor performance
    const batchSize = 100;
    const totalUsers = 4000;
    
    for (let i = 0; i < totalUsers; i += batchSize) {
      const values = [];
      const placeholders = [];
      
      const currentBatchSize = Math.min(batchSize, totalUsers - i);
      
      for (let j = 0; j < currentBatchSize; j++) {
        const id = ulid();
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const name = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'pedro.dev' }).toLowerCase();
        
        const offset = j * 4;
        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`
        );
        
        values.push(id, name, email, passwordHash);
        
        // Adiciona ao CSV (senha sem criptografia)
        csvData.push(`"${name}","${email}",pwd123`);
      }
      
      const query = `
        INSERT INTO users (id, name, email, password)
        VALUES ${placeholders.join(', ')}
      `;
      
      await client.query(query, values);
      
      console.log(`Inseridos ${i + currentBatchSize} de ${totalUsers} usuários...`);
    }

    await client.query('COMMIT');
    console.log('✅ 2000 usuários inseridos com sucesso!');
    
    // Gera o arquivo CSV
    const csvFilePath = path.join(__dirname, 'usuarios_gerados.csv');
    fs.writeFileSync(csvFilePath, csvData.join('\n'), 'utf8');
    console.log(`📄 Arquivo CSV gerado: ${csvFilePath}`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao inserir usuários:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function cleanupTestData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      WITH usuarios_para_deletar AS (
        SELECT id FROM users WHERE email LIKE '%@pedro.dev'
      ),
      delete_links AS (
        DELETE FROM links
        WHERE user_id IN (SELECT id FROM usuarios_para_deletar)
      )
      DELETE FROM users
      WHERE id IN (SELECT id FROM usuarios_para_deletar);
    `;

    await client.query(query);

    await client.query('COMMIT');
    console.log('Usuários e links de teste removidos com sucesso.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao remover dados de teste:', err);
  } finally {
    client.release();
  }
}

module.exports = { insertTestUsers, cleanupTestData };