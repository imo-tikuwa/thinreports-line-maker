@echo off

cd /D %~dp0
cd ..\webroot

REM ���[�J���G���A�ڑ��̃l�b�g���[�NIP���擾
for /f "tokens=1,2* usebackq delims=^:" %%i in (`netsh interface ipv4 show address "���[�J�� �G���A�ڑ�" ^| findstr "IP �A�h���X" ^| findstr /n /r "."`) do @set NetworkIP=%%k
call :Trim %NetworkIP%

echo %NetworkIP% | findstr /B 192.168. > nul
if %ERRORLEVEL% equ 0 (
    start php -S %NetworkIP%:80
)


REM �擾����IP�̋󔒍폜
:Trim
set NetworkIP=%*