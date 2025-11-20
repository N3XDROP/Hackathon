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
jsonpath "$.ok" == true
jsonpath "$.message" == "Usuario creado."


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
jsonpath "$.ok" == false
jsonpath "$.message" == "Correo ya registrado."


# -------------------------------
# 3) LOGIN EXITOSO
# -------------------------------
POST {{host}}/login
{
  "email": "{{email}}",
  "password": "12345678"
}
HTTP 200
[Asserts]
jsonpath "$.ok" == true
jsonpath "$.redirect" contains "chat-template"


# -------------------------------
# 4) LOGIN ERRÓNEO
# -------------------------------
POST {{host}}/login
{
  "email": "{{email}}",
  "password": "wrong_password"
}
HTTP 401
[Asserts]
jsonpath "$.ok" == false
jsonpath "$.message" contains "Credenciales incorrectas"
