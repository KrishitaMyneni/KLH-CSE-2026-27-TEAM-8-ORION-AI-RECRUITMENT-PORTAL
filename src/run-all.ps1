# ============================================================
# ORION - Start All Services
# ============================================================

$Root = $PSScriptRoot

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "        ORION - STARTING SERVICES         " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# Java Spring Boot Services
# ------------------------------------------------------------

$services = @(
    @{ Name = "API Gateway";       Folder = "api-gateway";         Port = 8080 },
    @{ Name = "Auth Service";      Folder = "auth-service";        Port = 8081 },
    @{ Name = "Candidate Service"; Folder = "candidate-service";   Port = 8082 },
    @{ Name = "Job Service";       Folder = "job-service";         Port = 8083 },
    @{ Name = "Application";       Folder = "application-service"; Port = 8084 },
    @{ Name = "Matching Service";  Folder = "matching-service";    Port = 8085 },
    @{ Name = "Skill Gap Service"; Folder = "skill-gap-service";   Port = 8086 },
    @{ Name = "Screening Service"; Folder = "screening-service";   Port = 8087 },
    @{ Name = "Notification";      Folder = "notification-service";Port = 8088 }
)

foreach ($service in $services) {

    $path = Join-Path $Root $service.Folder

    Write-Host "Starting $($service.Name) on port $($service.Port)..." -ForegroundColor Yellow

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$path'; .\mvnw.cmd spring-boot:run"
    )
}

# ------------------------------------------------------------
# Frontend
# ------------------------------------------------------------

$frontend = Join-Path $Root "frontend"

Write-Host "Starting Frontend on port 5173..." -ForegroundColor Green

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontend'; npm run dev"
)

# ------------------------------------------------------------
# FastAPI AI Service
# ------------------------------------------------------------

$ai = Join-Path $Root "JTH"

Write-Host "Starting FastAPI AI Service on port 8000..." -ForegroundColor Magenta

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ai'; python -m uvicorn ai.api.main:app --reload --port 8000"
)

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       ORION STARTUP COMMANDS SENT       " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend       : http://localhost:5173" -ForegroundColor Green
Write-Host "API Gateway    : http://localhost:8080" -ForegroundColor Green
Write-Host "Auth           : http://localhost:8081" -ForegroundColor Green
Write-Host "Candidate      : http://localhost:8082" -ForegroundColor Green
Write-Host "Job            : http://localhost:8083" -ForegroundColor Green
Write-Host "Application    : http://localhost:8084" -ForegroundColor Green
Write-Host "Matching       : http://localhost:8085" -ForegroundColor Green
Write-Host "Skill Gap      : http://localhost:8086" -ForegroundColor Green
Write-Host "Screening      : http://localhost:8087" -ForegroundColor Green
Write-Host "Notification   : http://localhost:8088" -ForegroundColor Green
Write-Host "AI             : http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "All services are being started in separate windows." -ForegroundColor Cyan
Write-Host ""