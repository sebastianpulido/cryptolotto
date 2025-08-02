#!/bin/bash

# CryptoLotto Development Cleanup Script
# This script kills any processes that might interfere with development

echo "🧹 Cleaning up development processes..."

# Kill processes using ports 3000 and 3001
echo "📡 Killing processes on ports 3000 and 3001..."
lsof -ti:3000,3001 2>/dev/null | xargs kill -9 2>/dev/null || true

# Kill Next.js development processes
echo "⚛️  Killing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

# Kill nodemon processes
echo "🔄 Killing nodemon processes..."
pkill -f "nodemon" 2>/dev/null || true

# Kill ts-node processes
echo "📝 Killing ts-node processes..."
pkill -f "ts-node" 2>/dev/null || true

# Kill any remaining node processes that might be related to our project
echo "🔍 Killing any remaining CryptoLotto processes..."
pkill -f "cryptolotto" 2>/dev/null || true

# Wait a moment for processes to fully terminate
echo "⏳ Waiting for processes to terminate..."
sleep 2

# Check if ports are now free
echo "🔍 Checking port availability..."
if lsof -ti:3000 >/dev/null 2>&1; then
    echo "⚠️  Warning: Port 3000 is still in use"
else
    echo "✅ Port 3000 is available"
fi

if lsof -ti:3001 >/dev/null 2>&1; then
    echo "⚠️  Warning: Port 3001 is still in use"
else
    echo "✅ Port 3001 is available"
fi

echo "🎉 Cleanup completed!"