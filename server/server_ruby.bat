@echo off

cd /D %~dp0
cd ../
bundle exec ruby app.rb -p 80