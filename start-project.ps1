# Script para ejecutar el proyecto completo - Cloud Monitoring System
# PowerShell - Windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Cloud Monitoring System - Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando existe
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# 1. Verificar Java 21+
Write-Host "✓ Verificando Java..." -ForegroundColor Yellow
if (Test-CommandExists java) {
    $javaVersion = java -version 2>&1
    Write-Host "Java encontrado: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Java 21+ no está instalado" -ForegroundColor Red
    Write-Host "Descárgalo aquí: https://www.oracle.com/java/technologies/downloads/#java21" -ForegroundColor Yellow
    exit
}

# 2. Verificar Node.js
Write-Host "✓ Verificando Node.js..." -ForegroundColor Yellow
if (Test-CommandExists node) {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Descárgalo aquí: https://nodejs.org/" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Iniciando servicios..." -ForegroundColor Cyan
Write-Host ""

# 3. Cambiar al directorio del proyecto
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# 4. Iniciar Frontend en terminal separada
Write-Host "📱 Iniciando Frontend (http://localhost:5173)..." -ForegroundColor Green
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

# Esperar un poco para que el frontend inicie
Start-Sleep -Seconds 3

# 5. Iniciar Backend
Write-Host "🔧 Iniciando Backend (http://localhost:8080)..." -ForegroundColor Green
$backendPath = Join-Path $projectRoot "backend"
cd $backendPath
.\gradlew bootRun

# El Backend correrá en el terminal actual
