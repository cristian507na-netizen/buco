# Script para subir todas las variables de .env.local a Vercel
# Requiere: npm install -g vercel  y  vercel login

$envFile = ".env.local"

if (!(Test-Path $envFile)) {
    Write-Host "No se encontro .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Leyendo $envFile y subiendo a Vercel..." -ForegroundColor Cyan

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    # Skip empty lines and comments
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $idx = $line.IndexOf("=")
    if ($idx -lt 0) { return }

    $name  = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim().Trim('"').Trim("'")

    Write-Host "Agregando: $name" -ForegroundColor Yellow
    # Add to production, preview AND development
    $value | vercel env add $name production  --force 2>&1
    $value | vercel env add $name preview     --force 2>&1
    $value | vercel env add $name development --force 2>&1
}

Write-Host ""
Write-Host "Listo! Ahora ejecuta: vercel --prod" -ForegroundColor Green
