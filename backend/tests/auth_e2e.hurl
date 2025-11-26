# ============================================
# AUTH E2E – Registro y Login
# ============================================

# -------------------------------
# 1) REGISTRO EXITOSO
# -------------------------------
POST {{host}}/api/auth/register
{
  "name": "User {{ts}}",
  "email": "{{email}}",
  "password": "12345678"
}
HTTP 200
[Asserts]
jsonpath "$.id" != null

# -------------------------------
# 2) REGISTRO DUPLICADO
# -------------------------------
POST {{host}}/api/auth/register
{
  "name": "User {{ts}}",
  "email": "{{email}}",
  "password": "12345678"
}
HTTP 409
[Asserts]
jsonpath "$.message" contains "Correo ya registrado"

# -------------------------------
# 3) LOGIN EXITOSO
# -------------------------------
POST {{host}}/api/auth/login
{
  "email": "{{email}}",
  "password": "12345678"
}
HTTP 200
[Captures]
session_token: jsonpath "$.token"
[Asserts]
jsonpath "$.ok" == true
jsonpath "$.role" matches "^(usuario|admin|comite)$"

# -------------------------------
# 4) LOGIN ERRÓNEO
# -------------------------------
POST {{host}}/api/auth/login
{
  "email": "{{email}}",
  "password": "wrong_password"
}
HTTP 401
[Asserts]
jsonpath "$.message" contains "Credenciales inválidas"
