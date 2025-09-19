import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const required = ['DB_HOST','DB_USER','DB_NAME'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing required DB environment variables:', missing.join(', '));
  process.exit(1);
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL pool ready ✅');
  } catch (err) {
    console.error('MySQL pool connection failed ❌', err.message);
  }
}
