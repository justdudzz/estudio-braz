# 🗄️ SCRIPT DE BACKUP (Point #19)
# Este script deve ser agendado no Task Scheduler (Windows) do servidor.

$BACKUP_DIR = "C:\Users\Edu\MyProject\backups\"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$FILENAME = "studio_braz_backup_$TIMESTAMP.sql"
$DB_URL = "postgresql://postgres:braz_master_2026@localhost:5432/studio_braz"

if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

# Executa o dump (requer pg_dump instalado no PATH do sistema)
try {
    & pg_dump "$DB_URL" > "$BACKUP_DIR$FILENAME"
    Write-Host "✅ Backup concluído com sucesso: $FILENAME" -ForegroundColor Gold
} catch {
    Write-Host "❌ ERRO NO BACKUP: $_" -ForegroundColor Red
}
