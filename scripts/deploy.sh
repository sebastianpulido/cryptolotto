#!/bin/bash

echo "🚀 Desplegando CryptoLotto..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir frontend
echo "🏗️ Construyendo frontend..."
cd frontend && npm run build && cd ..

# Construir backend
echo "🏗️ Construyendo backend..."
cd backend && npm run build && cd ..

# Desplegar contratos a devnet
echo "⛓️ Desplegando contratos a Solana devnet..."
cd smart-contracts && anchor deploy --provider.cluster devnet && cd ..

# Ejecutar migraciones de base de datos
echo "🗄️ Ejecutando migraciones..."
cd backend && npm run migrate && cd ..

echo "✅ Despliegue completado!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "📊 Dashboard: http://localhost:3001/health"