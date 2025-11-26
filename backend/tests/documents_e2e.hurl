# ============================================
# DOCUMENTOS E2E – Registro, Login y Gestión
# ============================================

# 1) REGISTRO DE USUARIO
POST {{host}}/api/auth/register
{
  "name": "User {{ts}}",
  "email": "{{email}}",
  "password": "12345678"
}
HTTP 200
[Captures]
user_id: jsonpath "$.id"

# 2) LOGIN PARA CAPTURAR TOKEN
POST {{host}}/api/auth/login
{
  "email": "{{email}}",
  "password": "12345678"
}
HTTP 200
[Captures]
session_token: jsonpath "$.token"

# 3) CREACIÓN DE DOCUMENTO
POST {{host}}/api/documents/create
Authorization: Bearer {{session_token}}
{
  "userId": {{ user_id }},
  "descripcionEntidad": "Empresa de prueba",
  "tipoEntidad": "SAS",
  "objetoSocial": "Servicios de software",
  "direccionFisica": "Calle 123",
  "residenciaBoyaca": "Tunja"
}
HTTP 200
[Captures]
doc_id: jsonpath "$.document.id"

# 6) LISTAR ARCHIVOS
GET {{host}}/api/documents/files/{{ doc_id }}
Authorization: Bearer {{session_token}}
HTTP 200

# 7) ACTUALIZAR ESTADO (APROBADO)
PUT {{host}}/api/documents/status/{{ doc_id }}
Authorization: Bearer {{session_token}}
{
  "status": "aprobado"
}
HTTP 200
