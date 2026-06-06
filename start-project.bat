@echo off
REM MicroCheck - Levantamiento del entorno completo con Docker Compose
REM Batch - Windows

color 0B
cls
echo ======================================
echo MicroCheck - Docker Compose Startup
echo ======================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo X Docker no esta instalado o no esta en el PATH.
    echo Instala Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo X Docker Desktop no esta en ejecucion. Inicialo y vuelve a intentar.
    pause
    exit /b 1
)
echo Docker listo.

set PROJECT_ROOT=%~dp0
cd /d %PROJECT_ROOT%

if not exist ".env" (
    echo X No se encontro el archivo .env en la raiz del proyecto.
    pause
    exit /b 1
)

echo.
echo Levantando stack (postgres + backend + frontend)...
docker compose up --build -d
if errorlevel 1 (
    echo X Error al levantar los contenedores.
    pause
    exit /b 1
)

echo.
echo Estado de los servicios:
docker compose ps

echo.
echo ======================================
echo Entorno listo
echo ======================================
echo Frontend:  http://localhost:80
echo API:       http://localhost:8080
echo API Key:   configurar changeme en el engranaje de la UI
echo.
echo Detener:   docker compose down
echo Reinicio:  docker compose down -v ^&^& docker compose up --build -d
echo.
pause
