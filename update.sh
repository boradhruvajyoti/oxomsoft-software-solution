#!/bin/bash
# ==============================================================================
# Oxomsoft Software Solution - Production Zero-Downtime Update Script
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

echo "====================================================="
echo "🚀 Starting Oxomsoft Software Solution Update..."
echo "====================================================="

# Determine project directory (directory containing this script)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "📂 Working directory: $PROJECT_DIR"

# 1. Pull latest code from GitHub main branch
echo "📥 [1/4] Pulling latest updates from GitHub..."
git pull origin main

# 2. Install / update dependencies (production mode)
echo "📦 [2/4] Installing dependencies..."
npm install --omit=dev

# 3. Reload PM2 cluster with zero downtime
echo "🔄 [3/4] Reloading PM2 cluster workers with zero downtime..."
pm2 reload ecosystem.config.js --env production --update-env || pm2 start ecosystem.config.js --env production

# 4. Show cluster status
echo "✅ [4/4] Update complete! Current cluster status:"
pm2 status

echo "====================================================="
echo "🎉 Oxomsoft is running live with the latest updates!"
echo "====================================================="
