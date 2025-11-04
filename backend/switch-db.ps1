<#
PowerShell helper para alternar entre .env de Supabase y .env de MySQL local
Uso:
  .\switch-db.ps1 -target mysql    # copia .env.mysql.example -> .env
  .\switch-db.ps1 -target supabase # copia .env.supabase.example -> .env

Esto evita editar manualmente .env cada vez.
#>
param(
  [Parameter(Mandatory=$true)]
  [ValidateSet("mysql","supabase")]
  [string]$target
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$source = Join-Path $scriptDir (".env.$target.example")
$dest = Join-Path $scriptDir ".env"

if (-not (Test-Path $source)) {
  Write-Error "Archivo de ejemplo no encontrado: $source"
  exit 1
}

Copy-Item -Path $source -Destination $dest -Force
Write-Host "Archivo .env actualizado desde: $source" -ForegroundColor Green
Write-Host "Recuerda instalar dependencias: npm install mysql2 --save (si usas mysql)" -ForegroundColor Yellow
