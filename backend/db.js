// Database connection helper for MySQL using mysql2's Promise API.
// This file is responsible for:
// - Reading DB settings from environment variables
// - Creating a reusable connection pool (recommended for web servers)
// - Supporting both local (Cloud SQL Proxy) and production (Cloud SQL Public IP) connections
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

// Connection configuration for Cloud SQL
// Local: Uses Cloud SQL Proxy on 127.0.0.1:3307
// Production (Heroku): Uses Cloud SQL Public IP with SSL
const poolConfig = {
  host: process.env.DB_HOST,           // Local: 127.0.0.1, Production: Cloud SQL Public IP
  port: process.env.DB_PORT || 3306,   // Local: 3307 (proxy), Production: 3306
  user: process.env.DB_USER,           // Cloud SQL username
  password: process.env.DB_PASS || '', // Cloud SQL password
  database: process.env.DB_NAME,       // Database name (e.g., unmute_db)
  waitForConnections: true,            // Back-pressure when too many requests
  connectionLimit: 10,                 // Max number of open connections
  queueLimit: 0,                       // 0 = unlimited queued requests
  connectTimeout: 10000,               // 10 seconds timeout for initial connection
};

// In production (Heroku), enable SSL for Cloud SQL Public IP connections
// Cloud SQL requires SSL when connecting via public IP
if (process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: false // Cloud SQL uses self-signed certs; set to true with proper CA if needed
  };
  console.log('🔒 SSL enabled for Cloud SQL production connection');
}

// Create a pool of connections. The pool will reuse connections
// instead of opening a new one for every request. This is more efficient
// and avoids exhausting the database with too many connections.
export const pool = mysql.createPool(poolConfig);

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL pool ready');
    console.log(`📍 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
  } catch (err) {
    // If this fails, check your .env credentials and Cloud SQL accessibility
    console.error('❌ MySQL pool connection failed:', err.message);
    console.error('💡 Troubleshooting:');
    console.error('   - Local: Ensure Cloud SQL Proxy is running on port 3307');
    console.error('   - Production: Verify Cloud SQL Public IP is accessible and SSL is configured');
    console.error('   - Check DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME env variables');
  }
}
