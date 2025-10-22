# ⚡️ Quick Reference: Cloud SQL + Heroku Setup

## 🎯 What Was Done

✅ Updated `backend/db.js` to support both local (Cloud SQL Proxy) and production (Public IP + SSL)  
✅ Created `.env.example` with all required variables  
✅ Updated `.env` for local Cloud SQL Proxy connection  
✅ Created `test-db.js` script to verify database connectivity  
✅ Created `configure-heroku.sh` script for easy Heroku setup  
✅ Full documentation in `CLOUD_SQL_SETUP.md`

---

## 🚀 Quick Start Commands

### Local Development (Cloud SQL Proxy)

```bash
# 1. Start Cloud SQL Proxy (in separate terminal)
./cloud-sql-proxy YOUR-PROJECT:REGION:INSTANCE --port=3307

# 2. Update backend/.env with your Cloud SQL credentials
# (Already done - just verify DB_USER and DB_PASS match your Cloud SQL)

# 3. Test the connection
cd backend
node test-db.js

# 4. Start development server
npm run dev
```

### Heroku Production Setup

```bash
# 1. Get your Cloud SQL Public IP from Google Cloud Console
# SQL → Your Instance → Overview → Public IP address

# 2. Edit and run the configuration script
nano configure-heroku.sh  # Replace placeholders
./configure-heroku.sh

# OR manually set each variable:
heroku config:set DB_HOST=YOUR_PUBLIC_IP --app unmute
heroku config:set DB_PORT=3306 --app unmute  
heroku config:set DB_USER=YOUR_USER --app unmute
heroku config:set DB_PASS=YOUR_PASS --app unmute
heroku config:set DB_NAME=unmute_db --app unmute
heroku config:set DB_SSL=true --app unmute
heroku config:set NODE_ENV=production --app unmute
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" --app unmute

# 3. Verify configuration
heroku config --app unmute

# 4. Deploy
git add .
git commit -m "Configure Cloud SQL for Heroku production"
git push heroku main

# 5. Monitor deployment
heroku logs --tail --app unmute

# 6. Test on Heroku
heroku run node backend/test-db.js --app unmute
heroku open --app unmute
```

---

## 📋 Environment Variables Reference

### Local (.env)
```
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=<your-cloud-sql-user>
DB_PASS=<your-cloud-sql-password>
DB_NAME=unmute_db
DB_SSL=false
JWT_SECRET=<local-secret>
PORT=5050
```

### Heroku (Config Vars)
```
NODE_ENV=production
DB_HOST=<cloud-sql-public-ip>
DB_PORT=3306
DB_USER=<your-cloud-sql-user>
DB_PASS=<your-cloud-sql-password>
DB_NAME=unmute_db
DB_SSL=true
JWT_SECRET=<strong-random-secret>
```

---

## 🔍 Key Differences: Local vs Production

| Setting | Local | Production (Heroku) |
|---------|-------|---------------------|
| **DB_HOST** | 127.0.0.1 | Cloud SQL Public IP |
| **DB_PORT** | 3307 | 3306 |
| **DB_SSL** | false | true |
| **Connection** | Cloud SQL Proxy | Direct Public IP + SSL |
| **NODE_ENV** | development | production |

---

## ✅ Success Indicators

When everything works, you'll see in logs:

```
✅ MySQL pool ready
📍 Connected to: 127.0.0.1:3307 (or Public IP:3306 on Heroku)
📊 Database: unmute_db
Server running on port 5050
```

---

## 🐛 Common Issues

**Local: `ECONNREFUSED 127.0.0.1:3307`**  
→ Cloud SQL Proxy not running. Start it in a separate terminal.

**Heroku: `ETIMEDOUT` or connection timeout**  
→ Cloud SQL Public IP not enabled or Heroku IPs not in Authorized Networks.

**Heroku: `ER_ACCESS_DENIED_ERROR`**  
→ Wrong credentials. Verify with `heroku config --app unmute`

**Heroku: `Missing required DB environment variables`**  
→ Config vars not set. Run `heroku config:set ...`

---

## 📚 Full Documentation

See `CLOUD_SQL_SETUP.md` for complete step-by-step guide with troubleshooting.

---

## 🎯 Next Steps

1. **Update `.env`** with your actual Cloud SQL credentials
2. **Start Cloud SQL Proxy** and test locally: `node backend/test-db.js`
3. **Get Cloud SQL Public IP** from Google Cloud Console
4. **Run `configure-heroku.sh`** (after editing) or set vars manually
5. **Deploy to Heroku**: `git push heroku main`
6. **Monitor**: `heroku logs --tail --app unmute`

---

**Need Help?** Check the full guide in `CLOUD_SQL_SETUP.md` 📖
