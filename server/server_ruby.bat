@echo off

chcp 65001
cd /D %~dp0
cd ../
bundle exec ruby app.rb -p 80