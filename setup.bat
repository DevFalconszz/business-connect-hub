@echo off
setlocal enabledelayedexpansion

:: =============================================================================
:: Business Connect Hub - Setup Script (Windows)
:: =============================================================================
:: Verifica requisitos, instala dependências e inicia o projeto.
:: Uso: .\setup.bat
:: =============================================================================

title Business Connect Hub - Setup

set PROJECT_DIR=%~dp0
set SERVER_DIR=%PROJECT_DIR%server

:: =============================================================================
:: STEP 1: Verificar Node.js
:: =============================================================================
echo.
echo ========================================
echo  Verificando requisitos do sistema...
echo ========================================

where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1,2,3 delims=v." %%a in ('node -v') do (
        set NODE_MAJOR=%%b
    )
    if !NODE_MAJOR! geq 18 (
        echo [✓] Node.js encontrado: v!NODE_MAJOR! (>=18)
    ) else (
        echo [!] Node.js v!NODE_MAJOR! detectado, mas ^>=18 recomendado.
    )
) else (
    echo [✗] Node.js nao encontrado!
    echo [!] Instale Node.js 18+ em: https://nodejs.org/
    echo     Depois execute este script novamente.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] npm encontrado
) else (
    echo [✗] npm nao encontrado!
    pause
    exit /b 1
)

:: =============================================================================
:: STEP 2: Verificar/Instalar Bun (opcional)
:: =============================================================================
set USE_BUN=false
where bun >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('bun --version') do set BUN_VER=%%v
    echo [✓] Bun encontrado: !BUN_VER!
    set USE_BUN=true
) else (
    echo [!] Bun nao encontrado. Usando npm.
    echo     Para instalar: powershell -c "irm bun.sh/install.ps1 ^| iex"
)

:: =============================================================================
:: STEP 3: Verificar OpenCode (para IA de prospecção)
:: =============================================================================
where opencode >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('opencode --version 2^>nul') do set OC_VER=%%v
    echo [✓] OpenCode CLI encontrado: !OC_VER!
    
    if exist "%PROJECT_DIR%.opencode\agents\lead-researcher.md" (
        echo [✓] Agente lead-researcher configurado
    ) else (
        echo [!] Agente lead-researcher nao encontrado
    )
) else (
    echo [!] OpenCode CLI nao encontrado. A prospeccao local usara dados de fallback.
    echo     Para usar IA real na prospeccao, instale: https://opencode.ai/
    echo     curl -fsSL https://opencode.ai/install.sh ^| sh
)

:: =============================================================================
:: STEP 4: Instalar dependencias do frontend
:: =============================================================================
echo.
echo ========================================
echo  Instalando dependencias do Frontend...
echo ========================================

cd /d "%PROJECT_DIR%"
if exist "package.json" (
    if "%USE_BUN%"=="true" (
        echo bun install...
        call bun install || goto :error
    ) else (
        echo npm install...
        call npm install || goto :error
    )
    echo [✓] Dependencias do frontend instaladas.

    :: Atualizar base de dados browserslist
    echo Atualizando base de dados browserslist...
    call npm install caniuse-lite@latest browserslist@latest 2>nul
    echo [✓] Browserslist atualizado.
) else (
    echo [✗] package.json nao encontrado!
    pause
    exit /b 1
)

:: =============================================================================
:: STEP 5: Instalar dependencias do servidor
:: =============================================================================
echo.
echo ========================================
echo  Instalando dependencias do Servidor...
echo ========================================

cd /d "%SERVER_DIR%"
if exist "package.json" (
    if "%USE_BUN%"=="true" (
        echo bun install (server)...
        call bun install || goto :error
    ) else (
        echo npm install (server)...
        call npm install || goto :error
    )
    echo [✓] Dependencias do servidor instaladas.
) else (
    echo [!] server/package.json nao encontrado. Pulando...
)

cd /d "%PROJECT_DIR%"

:: =============================================================================
:: STEP 6: Iniciar
:: =============================================================================
echo.
echo ========================================
echo   Business Connect Hub - INICIANDO
echo ========================================
echo.

:: Iniciar servidor backend
echo Iniciando servidor backend (porta 3001)...
cd /d "%SERVER_DIR%"
if "%USE_BUN%"=="true" (
    start "BC-HUB-Server" bun run start
) else (
    start "BC-HUB-Server" node index.js
)
cd /d "%PROJECT_DIR%"

timeout /t 3 /nobreak >nul

:: Iniciar frontend
echo Iniciando frontend (porta 8080)...
if "%USE_BUN%"=="true" (
    start "BC-HUB-Frontend" bun run --bun dev
) else (
    start "BC-HUB-Frontend" npm run dev
)

timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo  Business Connect Hub esta rodando!
echo ========================================
echo.
echo  Frontend:  http://localhost:8080
echo  Backend:   http://localhost:3001
echo  Health:    http://localhost:3001/api/health
echo.
echo  Feche as janelas para parar.
echo.
echo ========================================

pause
exit /b 0

:error
echo.
echo [✗] Erro durante a instalacao. Verifique os logs acima.
pause
exit /b 1
