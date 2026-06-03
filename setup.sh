#!/usr/bin/env bash

# =============================================================================
# Business Connect Hub - Setup Script (Linux/macOS)
# =============================================================================
# Verifica requisitos, instala dependências e inicia o projeto.
# Uso: chmod +x setup.sh && ./setup.sh
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

log()   { echo -e "${BLUE}${BOLD}[BC-HUB]${NC} $1"; }
ok()    { echo -e "${GREEN}${BOLD}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}${BOLD}[!]${NC} $1"; }
err()   { echo -e "${RED}${BOLD}[✗]${NC} $1"; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$PROJECT_DIR/server"

check_command() {
    if command -v "$1" &>/dev/null; then
        ok "$1 encontrado: $($1 --version 2>&1 | head -1)"
        return 0
    else
        warn "$1 não encontrado."
        return 1
    fi
}

ensure_command() {
    if ! check_command "$1"; then
        err "$1 é necessário. Instale-o e tente novamente."
        exit 1
    fi
}

# =============================================================================
# STEP 1: Verificar Node.js
# =============================================================================
log ""
log "========================================"
log " Verificando requisitos do sistema..."
log "========================================"

NODE_OK=false
NODE_VERSION=""

if check_command "node"; then
    NODE_VERSION=$(node -v 2>&1 | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ] 2>/dev/null; then
        ok "Node.js versão $NODE_VERSION (>=18.0.0)"
        NODE_OK=true
    else
        warn "Node.js $NODE_VERSION detectado, mas versão >=18 é recomendada."
        NODE_OK=true
    fi
fi

if [ "$NODE_OK" = false ]; then
    err "Node.js 18+ é necessário."
    warn "Instale via: https://nodejs.org/ ou use nvm:"
    warn "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash"
    warn "  nvm install 20"
    exit 1
fi

ensure_command "npm"

# =============================================================================
# STEP 2: Verificar/Instalar Bun (opcional, mais rápido)
# =============================================================================
USE_BUN=false
if check_command "bun"; then
    ok "Bun encontrado: $(bun --version)"
    USE_BUN=true
else
    log "Bun não encontrado. Usando npm (recomendado: instale bun para mais performance)."
    log "  curl -fsSL https://bun.sh/install | bash"
fi

# =============================================================================
# STEP 3: Verificar OpenCode (para IA de prospecção)
# =============================================================================
OPENCODE_OK=false
if check_command "opencode"; then
    OPENCODE_OK=true
    ok "OpenCode CLI encontrado: $(opencode --version 2>&1 | head -1)"
    
    # Verificar se o agente lead-researcher existe
    if [ -f "$PROJECT_DIR/.opencode/agents/lead-researcher.md" ]; then
        ok "Agente lead-researcher configurado"
    else
        warn "Agente lead-researcher não encontrado"
    fi
else
    warn "OpenCode CLI não encontrado. A prospecção local usará dados de fallback."
    warn "Para usar IA real na prospecção, instale: https://opencode.ai/"
    log "  curl -fsSL https://opencode.ai/install.sh | sh"
fi

# Verificar provedor de IA configurado
if [ "$OPENCODE_OK" = true ]; then
    log "Verificando provedor de IA configurado..."
    OPENCODE_CONFIG="$HOME/.config/opencode/opencode.jsonc"
    if [ -f "$OPENCODE_CONFIG" ]; then
        ok "OpenCode configurado em $OPENCODE_CONFIG"
    else
        warn "Nenhum provedor configurado. Execute: opencode providers"
        warn "Configure ao menos um provedor (ex: opencode, anthropic, openai)"
    fi
fi

# =============================================================================
# STEP 4: Instalar dependências do frontend
# =============================================================================
log ""
log "========================================"
log " Instalando dependências do Frontend..."
log "========================================"

cd "$PROJECT_DIR"
if [ -f "package.json" ]; then
    if [ "$USE_BUN" = true ]; then
        log "bun install..."
        bun install 2>&1 | tail -1
    else
        log "npm install..."
        npm install 2>&1 | tail -1
    fi
    ok "Dependências do frontend instaladas."
    
    # Atualizar base de dados browserslist
    log "Atualizando base de dados browserslist..."
    npm install caniuse-lite@latest browserslist@latest 2>&1 | tail -1
    ok "Browserslist atualizado."
else
    err "package.json não encontrado em $PROJECT_DIR"
    exit 1
fi

# =============================================================================
# STEP 5: Instalar dependências do servidor
# =============================================================================
log ""
log "========================================"
log " Instalando dependências do Servidor..."
log "========================================"

cd "$SERVER_DIR"
if [ -f "package.json" ]; then
    if [ "$USE_BUN" = true ]; then
        log "bun install (server)..."
        bun install 2>&1 | tail -1
    else
        log "npm install (server)..."
        npm install 2>&1 | tail -1
    fi
    ok "Dependências do servidor instaladas."
else
    warn "server/package.json não encontrado. Pulando servidor..."
fi

cd "$PROJECT_DIR"

# =============================================================================
# STEP 6: Iniciar
# =============================================================================
log ""
log "========================================"
log " ${BOLD}Business Connect Hub - INICIANDO"
log "========================================"
echo ""

stop_all() {
    log ""
    log "Encerrando processos..."
    kill $SERVER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap stop_all SIGINT SIGTERM

# Iniciar servidor backend
log "Iniciando servidor backend (porta 3001)..."
cd "$SERVER_DIR"
if [ "$USE_BUN" = true ]; then
    bun run start &
else
    node index.js &
fi
SERVER_PID=$!
cd "$PROJECT_DIR"

sleep 2

# Verificar se servidor subiu
if kill -0 $SERVER_PID 2>/dev/null; then
    ok "Servidor backend rodando em http://localhost:3001"
else
    warn "Servidor backend não iniciou. Verifique os logs."
fi

# Iniciar frontend
log ""
log "Iniciando frontend (porta 8080)..."
if [ "$USE_BUN" = true ]; then
    bun run --bun dev &
else
    npm run dev &
fi
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║     Business Connect Hub está rodando!        ║${NC}"
echo -e "${GREEN}${BOLD}╠════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}${BOLD}║                                              ║${NC}"
echo -e "${GREEN}${BOLD}║  Frontend:  http://localhost:8080             ║${NC}"
echo -e "${GREEN}${BOLD}║  Backend:   http://localhost:3001             ║${NC}"
echo -e "${GREEN}${BOLD}║  Health:    http://localhost:3001/api/health  ║${NC}"
echo -e "${GREEN}${BOLD}║                                              ║${NC}"
echo -e "${GREEN}${BOLD}║  Pressione Ctrl+C para parar                 ║${NC}"
echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Aguardar ambos os processos
wait $FRONTEND_PID $SERVER_PID
