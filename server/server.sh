#!/bin/bash

PORT=3001
APP_ROOT=$(dirname $(cd $(dirname $0); pwd))
cd $APP_ROOT

start() {
  bundle exec ruby app.rb -o 0.0.0.0 -p $PORT >> $APP_ROOT/log/application.log 2>&1 &
}
stop() {
  lsof -i :$PORT | awk 'NR > 1 {print $2}' | xargs kill -9
}

case "$1" in
  start)
        start
        ;;
  stop)
        stop
        ;;
  *)
        echo $"Usage: ./server.sh {start|stop}"
esac