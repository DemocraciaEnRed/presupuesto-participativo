# Arriba el docker de mongo
docker ps -a | grep mongodb-der | docker start mongodb-der || docker run --name "mongodb-der" -p 27017:27017 --volume `pwd`/tmp/db:/data/db -w /data/db -d mongo:3.2

# Uso node v8
source ~/.nvm/nvm.sh
nvm use v8.17.0

# Arriba react!
NODE_PATH=. DEBUG=democracyos* ./node_modules/.bin/gulp bws
