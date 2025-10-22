// Test script to verify Cloud SQL database connection
// Usage: node backend/test-db.js

import { pool, testConnection } from './db.js';

async function testQuery() {
  console.log('🧪 Testing Cloud SQL database connection...\n');
  
  // Test basic connectivity
  await testConnection();
  
  try {
    // Test 1: Show all tables
    console.log('\n📋 Test 1: Listing tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📊 Tables in database:');
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found - database may be empty');
    } else {
      tables.forEach(row => console.log('   ✓', Object.values(row)[0]));
    }
    
    // Test 2: Count users (adjust table name if needed)
    console.log('\n📋 Test 2: Querying users table...');
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`   👥 Total users: ${users[0].count}`);
    
    // Test 3: Sample user data (limit 1 for safety)
    console.log('\n📋 Test 3: Sample user record...');
    const [sampleUsers] = await pool.query('SELECT user_id, username, email, created_at FROM users LIMIT 1');
    if (sampleUsers.length > 0) {
      console.log('   Sample user:', sampleUsers[0]);
    } else {
      console.log('   ℹ️  No users in database yet');
    }
    
    console.log('\n✅ All database tests passed!\n');
    console.log('🎉 Your Cloud SQL connection is working correctly!');
    console.log('💡 You can now deploy to Heroku with confidence.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database test failed:', err.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   - Verify Cloud SQL Proxy is running (local)');
    console.error('   - Check DB_HOST, DB_PORT, DB_USER, DB_PASS in .env');
    console.error('   - Ensure database "unmute_db" exists and is imported');
    console.error('   - Verify Cloud SQL user has proper permissions\n');
    process.exit(1);
  }
}

// Run the test
testQuery();
