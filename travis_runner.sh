sh -e /etc/init.d/xvfb start
sleep 3
echo $1 $2
$1 $2
