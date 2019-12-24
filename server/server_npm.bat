@echo off

cd /D %~dp0
cd ..\webroot
./node_modules/.bin/http-server -p 80