#!/bin/bash

echo "🎰 Configurando CryptoLotto..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar Rust y Solana CLI
if ! command -v rustc &> /dev/null; then
    echo "📦 Instalando Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source ~/.cargo/env
fi

if ! command -v solana &> /dev/null; then
    echo "⚡ Instalando Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

# Verificar Anchor
if ! command -v anchor &> /dev/null; then
    echo "⚓ Instalando Anchor..."
    npm install -g @coral-xyz/anchor-cli
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Configurar Solana para devnet
echo "🔧 Configurando Solana..."
solana config set --url devnet
solana-keygen new --no-bip39-passphrase --silent --outfile ~/.config/solana/id.json || true

# Obtener SOL para desarrollo
echo "💰 Obteniendo SOL para desarrollo..."
solana airdrop 2

# Construir contratos
echo "🔨 Construyendo smart contracts..."
cd smart-contracts
anchor build
cd ..

# Configurar variables de entorno
echo "⚙️ Configurando variables de entorno..."
cp .env.example .env.local

echo "✅ ¡Configuración completada!"
echo ""
echo "🚀 Para iniciar el desarrollo:"
echo "   npm run dev"
echo ""
echo "📚 Para despl