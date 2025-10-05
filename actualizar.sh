#!/usr/bin/env bash
set -e

echo "🚀 Iniciando actualización del proyecto Calendario Familiar..."

# Ir a la carpeta del proyecto
cd ~/Documents/Calendario\ familiar || { echo "❌ No se encontró la carpeta del proyecto"; exit 1; }

# Traer cambios remotos (por si tocaste algo en GitHub)
echo "📥 Sincronizando con GitHub..."
git pull origin main --allow-unrelated-histories

# ¿Hay cambios locales?
if [[ -n "$(git status --porcelain)" ]]; then
  echo "📦 Añadiendo archivos modificados..."
  git add .

  mensaje="Actualización automática del proyecto Calendario Familiar - $(date '+%Y-%m-%d %H:%M:%S')"
  echo "📝 Creando commit: $mensaje"
  git commit -m "$mensaje"

  echo "⬆️ Subiendo cambios a GitHub..."
  git push origin main

  echo "✅ Listo: GitHub actualizado. Vercel desplegará en breve."
else
  echo "ℹ️ No hay cambios locales; nada que subir."
fi

# Aviso en macOS y abrir la web
osascript -e 'display notification "Proceso finalizado" with title "Calendario Familiar" sound name "Ping"'
open "https://calendariofamiliar.vercel.app" >/dev/null 2>&1 || true

echo "🌐 Revisa: https://calendariofamiliar.vercel.app"
