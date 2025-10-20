#!/bin/bash

echo "🛑 Stopping ÖDP-MD² Platform"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kill backend
echo "Stopping backend (port 3001)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
pkill -f "ts-node.*server" 2>/dev/null

# Kill frontend
echo "Stopping frontend (port 5173)..."
lsof -ti:5173 | xargs kill -9 2>/dev/null
pkill -f "vite" 2>/dev/null

sleep 2

echo ""
echo "✅ All services stopped"
echo ""
