const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql } = require('drizzle-orm');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/loan_db';
const client = postgres(connectionString);
const db = drizzle(client);

async function checkTableStructure() {
  try {
    // 查询channels表结构
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'channels'
      ORDER BY ordinal_position;
    `);
    
    console.log('Channels table structure:');
    if (result && result.rows) {
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('No data returned');
      console.log(result);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking table structure:', error);
    process.exit(1);
  }
}

checkTableStructure();