import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql', // 添加 dialect 配置
  schema: './libs/database/schema.ts',
  out: './libs/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/loan_db',
  },
} satisfies Config;