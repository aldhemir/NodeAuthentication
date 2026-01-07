import 'dotenv/config'; // Atualização 1: Padrão ES Modules
import { Pool } from 'pg';

// Atualização 2: Verificação de Segurança (Fail Fast)
const connectionString = process.env.DB_CONNECTION;

if (!connectionString) {
  throw new Error('FATAL: A variável DB_CONNECTION não foi definida no .env');
}

// Atualização 3: Configuração Robusta
export const db = new Pool({
  connectionString,
  // Dica: Bancos em nuvem (Render, AWS, Neon) exigem SSL. 
  // Essa linha habilita SSL apenas em produção ou se a string de conexão exigir.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 10, // Limite de conexões simultâneas (boa prática)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});