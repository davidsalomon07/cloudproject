# MicroCheck - Levantamiento del entorno completo con Docker Compose
# PowerShell - Windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "MicroCheck - Docker Compose Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

Write-Host "Verificando Docker..." -ForegroundColor Yellow
if (-not (Test-CommandExists docker)) {
    Write-Host "Docker no esta instalado o no esta en el PATH." -ForegroundColor Red
    Write-Host "Instala Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Desktop no esta en ejecucion. Inicialo y vuelve a intentar." -ForegroundColor Red
    exit 1
}
Write-Host "Docker listo." -ForegroundColor Green

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

if (-not (Test-Path ".env")) {
    Write-Host "No se encontro el archivo .env en la raiz del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Levantando stack (postgres + backend + frontend)..." -ForegroundColor Cyan
docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al levantar los contenedores." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Estado de los servicios:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Entorno listo" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:80"
Write-Host "API:       http://localhost:8080"
Write-Host "API Key:   configurar 'changeme' en el engranaje de la UI"
Write-Host ""
Write-Host "Detener:   docker compose down"
Write-Host "Reinicio:  docker compose down -v && docker compose up --build -d"
Write-Host ""
