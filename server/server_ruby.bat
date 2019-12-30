@echo off

cd /D %~dp0
cd ..\public
ruby -run -e httpd . -p 80 &