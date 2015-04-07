export DISPLAY=:99.0
sleep 3
ember build
sh -e /etc/init.d/xvfb start
ember test
