@echo off
setlocal

echo ==== Iniciando pruebas de Auth ====
echo.

set HOST=http://localhost:4000

rem Generar timestamp simple (año-mes-día-hora-minuto-segundo)
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
  set DATE=%%d%%b%%c
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
  set TIME=%%a%%b
)
set TS=%DATE%%TIME%
set EMAIL=auth_%TS%@example.com

rem Ejecutar pruebas con Hurl
hurl --verbose --variable host=%HOST% --variable ts=%TS% --variable email=%EMAIL% tests\auth_e2e.hurl

if %errorlevel%==0 (
  echo [REGISTRO EXITOSO] OK
  echo [REGISTRO DUPLICADO] OK
  echo [LOGIN EXITOSO] OK
  echo [LOGIN ERRÓNEO] OK
  echo.
  echo =====================================
  echo Todas las pruebas de Auth pasaron
  echo =====================================
) else (
  echo.
  echo =====================================
  echo Algunas pruebas de Auth fallaron
  echo =====================================
)

pause
endlocal
