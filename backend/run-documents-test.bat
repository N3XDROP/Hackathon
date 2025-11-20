@echo off
setlocal

echo ==== Iniciando pruebas de Documentos ====
echo.

set HOST=http://localhost:4000
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set DATE=%%d%%b%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME=%%a%%b
set TS=%DATE%%TIME%
set EMAIL=doc_%TS%@example.com

rem 1–3: registro, login, creación con Hurl y volcado de capturas
hurl --verbose --variable host=%HOST% --variable ts=%TS% --variable email=%EMAIL% ^
  --to-entry 3 --json tests\documents_e2e.hurl > captures.json

rem Parsear capturas con Node (ruta absoluta del .bat)
for /f "usebackq tokens=1* delims==" %%a in (`node "%~dp0parseCaptures.js"`) do set "%%a=%%b"

echo DOC_ID=%DOC_ID%
echo SESSION_COOKIE=%SESSION_COOKIE%

rem Validaciones antes de subir
if "%DOC_ID%"=="" (
  echo [ERROR] DOC_ID vacio. Revisa captures.json y parseCaptures.js
  type captures.json
  goto end_fail
)
if "%SESSION_COOKIE%"=="" (
  echo [ERROR] SESSION_COOKIE vacio. Revisa captures.json y parseCaptures.js
  type captures.json
  goto end_fail
)

echo Subiendo RUT con curl.exe...
curl.exe -X POST %HOST%/api/documents/upload/%DOC_ID% ^
  -H "Cookie: %SESSION_COOKIE%" ^
  -F "field=rut" ^
  -F "file=@tests/files/rut.pdf;type=application/pdf"

echo Subiendo CEDULA con curl.exe...
curl.exe -X POST %HOST%/api/documents/upload/%DOC_ID% ^
  -H "Cookie: %SESSION_COOKIE%" ^
  -F "field=cedula" ^
  -F "file=@tests/files/cedula.pdf;type=application/pdf"

rem 4–5: listado y estado aprobado
hurl --verbose ^
  --variable host=%HOST% --variable ts=%TS% --variable email=%EMAIL% ^
  --variable doc_id=%DOC_ID% --variable session_cookie=%SESSION_COOKIE% ^
  tests\documents_e2e.hurl --from-entry 4 --to-entry 5

if %errorlevel%==0 (
  echo.
  echo =====================================
  echo Todo OK: subidas, listado y estado
  echo =====================================
) else (
  goto end_fail
)

goto end_ok

:end_fail
echo.
echo =====================================
echo Algunas pruebas fallaron
echo =====================================
pause
goto :eof

:end_ok
pause
endlocal
