import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/loan_db';
const client = postgres(connectionString);
export const db = drizzle(client);

// 导出所有表
export * from './schema';