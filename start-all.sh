#!/bin/bash

echo "🚀 Starting ÖDP-MD² Platform"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
pkill -f "ts-node.*server" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend
echo "🔧 Starting backend..."
cd backend && npx ts-node --transpile-only src/server.ts > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Check backend
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend running on port 3001"
else
    echo "❌ Backend failed to start"
    tail -20 backend.log
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend..."
cd frontend && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3

# Check frontend
if lsof -i :5173 | grep LISTEN > /dev/null; then
    echo "✅ Frontend running on port 5173"
else
    echo "❌ Frontend failed to start"
    tail -20 frontend.log
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PLATFORM READY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "📋 Login credentials:"
echo "   Admin: admin@oedp.de / Admin123!"
echo "   Bob:   bob@oedp.de / Test123!"
echo ""
echo "📊 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop: ./stop-all.sh"
echo ""
