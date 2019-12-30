@echo off

cd /D %~dp0
cd ..\public
./node_modules/.bin/http-server -p 80