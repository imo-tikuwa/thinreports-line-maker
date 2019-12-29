@echo off

cd /D %~dp0
cd ..\webroot
ruby -run -e httpd . -p 80 &