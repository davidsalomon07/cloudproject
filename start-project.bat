@echo off
REM Script para ejecutar el proyecto completo - Cloud Monitoring System
REM Batch - Windows

color 0B
cls
echo ======================================
echo Cloud Monitoring System - Startup
echo ======================================
echo.

REM Verificar Java
echo Verificando Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo X Java 21+ no esta instalado
    echo Descargalo aqui: https://www.oracle.com/java/technologies/downloads/#java21
    pause
    exit /b 1
)
for /f tokens^=2 "delims= " %%i in ('java -version 2^>^&1') do (
    echo Java encontrado: %%i
    goto :check_node
)

:check_node
REM Verificar Node.js
echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo X Node.js no esta instalado
    echo Descargalo aqui: https://nodejs.org/
    pause
    exit /b 1
)
for /f tokens^=1 "delims= " %%i in ('node --version 2^>^&1') do (
    echo Node.js encontrado: %%i
)

echo.
echo Iniciando servicios...
echo.

REM Obtener el directorio del proyecto
set PROJECT_ROOT=%~dp0

REM Iniciar Frontend en ventana separada
echo Iniciando Frontend (http://localhost:5173)...
start cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"

REM Esperar un poco
timeout /t 3 /nobreak

REM Iniciar Backend
echo Iniciando Backend (http://localhost:8080)...
cd /d %PROJECT_ROOT%backend
call gradlew.bat bootRun
