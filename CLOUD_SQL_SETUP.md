# 🚀 Cloud SQL + Heroku Deployment Guide

This guide walks you through connecting your Node.js app to **Google Cloud SQL** both locally and on **Heroku**.

---

## 📋 Prerequisites

✅ Cloud SQL instance created with `unmute_db` database imported  
✅ Cloud SQL Proxy installed and running locally  
✅ Heroku account and Heroku CLI installed  
✅ Git repository connected to Heroku

---

## 🏠 Local Development Setup

### 1. Start Cloud SQL Proxy

```bash
# Start the proxy (replace with your instance connection name)
./cloud-sql-proxy <YOUR-PROJECT>:<REGION>:<INSTANCE-NAME> --port=3307
```

**Example:**
```bash
./cloud-sql-proxy unmute-project:us-central1:unmute-instance --port=3307
```

Keep this terminal running while developing.

### 2. Create Local Environment File

Copy the example file and fill in your credentials:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your actual values:

```env
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=your_cloud_sql_username
DB_PASS=your_cloud_sql_password
DB_NAME=unmute_db
DB_SSL=false
JWT_SECRET=local-dev-secret-change-for-production
PORT=5050
```

### 3. Test Local Connection

```bash
# From backend directory
npm install
npm run dev

# You should see:
# ✅ MySQL pool ready
# 📍 Connected to: 127.0.0.1:3307
# 📊 Database: unmute_db
# Server running on port 5050
```

---

## ☁️ Heroku Production Setup

### 1. Enable Cloud SQL Public IP

In Google Cloud Console:
1. Go to **SQL** → Select your instance
2. Click **Connections** → **Networking**
3. Enable **Public IP**
4. Add **Authorized Networks** (optional, for security):
   - Add `0.0.0.0/0` to allow Heroku (less secure but simple)
   - OR get Heroku's IP ranges and add specific ranges

**Copy the Public IP address** (you'll need it for Heroku config).

### 2. Set Heroku Environment Variables

Replace placeholders with your actual Cloud SQL values:

```bash
heroku config:set NODE_ENV=production --app unmute
heroku config:set DB_HOST=<YOUR_CLOUD_SQL_PUBLIC_IP> --app unmute
heroku config:set DB_PORT=3306 --app unmute
heroku config:set DB_USER=<YOUR_CLOUD_SQL_USERNAME> --app unmute
heroku config:set DB_PASS=<YOUR_CLOUD_SQL_PASSWORD> --app unmute
heroku config:set DB_NAME=unmute_db --app unmute
heroku config:set DB_SSL=true --app unmute
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" --app unmute
```

**Example:**
```bash
heroku config:set DB_HOST=34.123.45.67 --app unmute
heroku config:set DB_USER=root --app unmute
heroku config:set DB_PASS=MySecurePassword123 --app unmute
```

### 3. Verify Configuration

```bash
heroku config --app unmute

# Should show:
# DB_HOST:        34.123.45.67
# DB_NAME:        unmute_db
# DB_PASS:        MySecurePassword123
# DB_PORT:        3306
# DB_SSL:         true
# DB_USER:        root
# JWT_SECRET:     <generated-secret>
# NODE_ENV:       production
```

### 4. Deploy to Heroku

#### Option A: Push from Git

```bash
# From repo root
git add .
git commit -m "Configure Cloud SQL connection for Heroku"
git push heroku main
```

#### Option B: GitHub Integration

If using GitHub integration, just push to your GitHub branch:

```bash
git push origin main
```

Heroku will auto-deploy if you enabled automatic deploys.

### 5. Monitor Deployment

```bash
# Watch the build logs
heroku logs --tail --app unmute

# Look for:
# ✅ MySQL pool ready
# 📍 Connected to: 34.123.45.67:3306
# 📊 Database: unmute_db
# Server running on port <PORT>
```

### 6. Test Production App

```bash
# Open the app
heroku open --app unmute

# Or visit directly
# https://unmute-0a372a8d3b08.herokuapp.com
```

---

## 🧪 Testing Database Connection

### Quick Connection Test Script

Create `backend/test-db.js`:

```javascript
import { pool, testConnection } from './db.js';

async function testQuery() {
  console.log('🧪 Testing database connection...\n');
  
  await testConnection();
  
  try {
    // Test a simple query
    const [rows] = await pool.query('SHOW TABLES');
    console.log('\n📊 Tables in database:');
    rows.forEach(row => console.log('  -', Object.values(row)[0]));
    
    // Test a count query
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users: ${users[0].count}`);
    
    console.log('\n✅ All database tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database test failed:', err.message);
    process.exit(1);
  }
}

testQuery();
```

Run locally:
```bash
node backend/test-db.js
```

Run on Heroku:
```bash
heroku run node backend/test-db.js --app unmute
```

---

## 🔒 Security Best Practices

### 1. Restrict Cloud SQL Access (Recommended)

Instead of allowing all IPs (`0.0.0.0/0`), whitelist Heroku's IP ranges:
- Get current IPs from [Heroku Status](https://status.heroku.com/status)
- Add them to Cloud SQL **Authorized Networks**

### 2. Use Cloud SQL Auth Proxy on Heroku (Advanced)

For better security, use Cloud SQL Auth Proxy as a sidecar:
- Requires Heroku Exec buildpack
- More complex setup but eliminates public IP exposure

### 3. Rotate Credentials Regularly

```bash
# Generate new JWT secret
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" --app unmute
```

### 4. Enable SSL Certificate Validation (Production)

Once you have the Cloud SQL server CA certificate:

```javascript
// In db.js, update SSL config:
ssl: {
  ca: fs.readFileSync('/path/to/server-ca.pem'),
  rejectUnauthorized: true
}
```

---

## 🐛 Troubleshooting

### Local Connection Fails

**Error:** `ECONNREFUSED 127.0.0.1:3307`

**Solution:** Cloud SQL Proxy is not running.
```bash
./cloud-sql-proxy your-project:region:instance --port=3307
```

---

### Heroku Connection Fails

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solutions:**
1. Verify credentials:
   ```bash
   heroku config --app unmute
   ```
2. Check Cloud SQL user has proper permissions
3. Ensure Public IP is enabled

---

**Error:** `ETIMEDOUT` or `connect ETIMEDOUT`

**Solutions:**
1. Verify Cloud SQL Public IP in Heroku config
2. Check **Authorized Networks** allows Heroku IPs (or `0.0.0.0/0`)
3. Verify firewall rules in Google Cloud

---

**Error:** `Missing required DB environment variables`

**Solution:** Set all required config vars:
```bash
heroku config:set DB_HOST=x DB_USER=x DB_NAME=x DB_PASS=x --app unmute
```

---

### SSL Connection Issues

**Error:** `SSL connection error`

**Solution:** Ensure `DB_SSL=true` on Heroku and `DB_SSL=false` locally:
```bash
heroku config:set DB_SSL=true --app unmute
```

---

## 📚 Additional Resources

- [Cloud SQL Proxy Documentation](https://cloud.google.com/sql/docs/mysql/sql-proxy)
- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/deploying-nodejs)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [Heroku Config Vars](https://devcenter.heroku.com/articles/config-vars)

---

## ✅ Final Checklist

- [ ] Cloud SQL Proxy running locally on port 3307
- [ ] `.env` file created with local credentials
- [ ] Local app connects successfully (see green checkmarks in logs)
- [ ] Cloud SQL Public IP enabled
- [ ] Heroku config vars set (verify with `heroku config`)
- [ ] Latest code pushed to Heroku
- [ ] Heroku logs show successful database connection
- [ ] Production app accessible via `heroku open`

---

**Need help?** Check the troubleshooting section or review Heroku logs:
```bash
heroku logs --tail --app unmute
```
