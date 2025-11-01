// Database connection helper for MySQL using mysql2's Promise API.
// This file is responsible for:
// - Reading DB settings from environment variables
// - Creating a reusable connection pool (recommended for web servers)
// - Supporting Railway MySQL hosting
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

// Connection configuration for Railway MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,   // make sure this is included
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Export the pool for use in other modules
export { pool };

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL pool ready');
    console.log(`📍 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
  } catch (err) {
    // If this fails, check your .env credentials and Railway MySQL accessibility
    console.error('❌ MySQL pool connection failed:', err.message);
    console.error('💡 Troubleshooting:');
    console.error('   - Verify Railway MySQL service is running and accessible');
    console.error('   - Check DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME env variables');
    console.error('   - Ensure Railway environment variables are properly configured');
  }
}
