#!/bin/bash

# Business Connect Hub - Lead Researcher Server Startup Script

echo "🚀 Business Connect Hub - Lead Researcher Server"
echo "================================================"

# Verifica se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale Python 3.8+ primeiro."
    exit 1
fi

# Verifica versão do Python
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "✅ Python versão: $PYTHON_VERSION"

# Cria ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativa o ambiente virtual
echo "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Instala dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt -q

# Verifica se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do exemplo..."
    cp .env.example .env
    echo "📝 Edite o arquivo .env com suas chaves de API."
fi

# Inicia o servidor
echo "🚀 Iniciando servidor na porta ${PORT:-3001}..."
echo "📡 Acesse: http://localhost:${PORT:-3001}"
echo "🔍 Health: http://localhost:${PORT:-3001}/api/health"
echo "🔎 Search: POST http://localhost:${PORT:-3001}/api/search-leads"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""

python3 main.py
