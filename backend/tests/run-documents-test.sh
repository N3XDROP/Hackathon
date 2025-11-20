#!/bin/bash

echo "==== Iniciando pruebas de Documentos ===="
echo ""

HOST="http://localhost:4000"
TS=$(date +%s)
EMAIL="doc_${TS}@example.com"

hurl --variable host=$HOST \
     --variable ts=$TS \
     --variable email=$EMAIL \
     tests/documents_e2e.hurl >/dev/null

if [ $? -eq 0 ]; then
  echo "[REGISTRO USUARIO] OK"
  echo "[CREACIÓN DOCUMENTO] OK"
  echo "[RUT SUBIDO] OK"
  echo "[CÉDULA SUBIDA] OK"
  echo "[LISTADO ARCHIVOS] OK"
  echo "[ESTADO APROBADO] OK"
  echo "[ELIMINACIÓN ADMIN] OK"
  echo ""
  echo "====================================="
  echo "Todas las pruebas de Documentos pasaron"
  echo "====================================="
else
  echo ""
  echo "====================================="
  echo "Algunas pruebas de Documentos fallaron"
  echo "====================================="
fi
