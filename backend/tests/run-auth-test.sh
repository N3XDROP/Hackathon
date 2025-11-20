#!/bin/bash

echo "==== Iniciando pruebas de Auth ===="
echo ""

HOST="http://localhost:4000"
TS=$(date +%s)
EMAIL="auth_${TS}@example.com"

hurl --variable host=$HOST \
     --variable ts=$TS \
     --variable email=$EMAIL \
     tests/auth_e2e.hurl >/dev/null

if [ $? -eq 0 ]; then
  echo "[REGISTRO EXITOSO] OK"
  echo "[REGISTRO DUPLICADO] OK"
  echo "[LOGIN EXITOSO] OK"
  echo "[LOGIN ERRÓNEO] OK"
  echo ""
  echo "====================================="
  echo "Todas las pruebas de Auth pasaron"
  echo "====================================="
else
  echo ""
  echo "====================================="
  echo "Algunas pruebas de Auth fallaron"
  echo "====================================="
fi
