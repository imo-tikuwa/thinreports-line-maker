@echo off

cd /D %~dp0
cd ..\webroot

REM Wi-Fi接続のネットワークIPを取得
for /f "tokens=1,2* usebackq delims=^:" %%i in (`netsh interface ipv4 show address "Wi-Fi" ^| findstr "IP アドレス" ^| findstr /n /r "."`) do @set NetworkIP=%%k
call :Trim %NetworkIP%

echo %NetworkIP% | findstr /B 192.168. > nul
if %ERRORLEVEL% equ 0 (
    start php -S %NetworkIP%:80
)


REM 取得したIPの空白削除
:Trim
set NetworkIP=%*