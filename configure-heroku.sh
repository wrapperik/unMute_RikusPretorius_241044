#!/bin/bash
# Heroku Cloud SQL Configuration Script
# Your Cloud SQL credentials filled in

echo "🚀 Setting Heroku config variables for Cloud SQL..."

# Production environment
heroku config:set NODE_ENV=production --app unmute

# Cloud SQL Public IP (from Google Cloud Console)
heroku config:set DB_HOST=35.225.238.245 --app unmute

# Port 3306 for Cloud SQL (not 3307 like local proxy)
heroku config:set DB_PORT=3306 --app unmute

# Your Cloud SQL username (using heroku-user, not root which uses IAM)
heroku config:set DB_USER=heroku-user --app unmute

# Your Cloud SQL password
heroku config:set DB_PASS='+T6k^@sA>z0~CG[a' --app unmute

# Database name
heroku config:set DB_NAME=unmute_db --app unmute

# Enable SSL for Cloud SQL public IP connections
heroku config:set DB_SSL=true --app unmute

# Generate a secure JWT secret
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" --app unmute

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📋 Verify your settings:"
echo "heroku config --app unmute"
echo ""
echo "🚀 Deploy your app:"
echo "git add ."
echo "git commit -m 'Configure Cloud SQL for production'"
echo "git push heroku main"
echo ""
echo "📊 Monitor logs:"
echo "heroku logs --tail --app unmute"