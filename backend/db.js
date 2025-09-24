// Database connection helper for MySQL using mysql2's Promise API.
// This file is responsible for:
// - Reading DB settings from environment variables
// - Creating a reusable connection pool (recommended for web servers)
// - Exporting a small health-check function to verify connectivity

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config(); // Loads variables from .env into process.env

// Basic validation: make sure we got the critical DB settings.
const required = ['DB_HOST','DB_USER','DB_NAME'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing required DB environment variables:', missing.join(', '));
  process.exit(1);
}

// Create a pool of connections. The pool will reuse connections
// instead of opening a new one for every request. This is more efficient
// and avoids exhausting the database with too many connections.
export const pool = mysql.createPool({
  host: process.env.DB_HOST,           // e.g. localhost
  user: process.env.DB_USER,           // DB username
  password: process.env.DB_PASS || '', // DB password (can be empty)
  database: process.env.DB_NAME,       // Schema/database to use
  waitForConnections: true,            // Back-pressure when too many requests
  connectionLimit: 10,                 // Max number of open connections
  queueLimit: 0                        // 0 = unlimited queued requests
});

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL pool ready ✅');
  } catch (err) {
    // If this fails, check your .env credentials and that MySQL is running.
    console.error('MySQL pool connection failed ❌', err.message);
  }
}
