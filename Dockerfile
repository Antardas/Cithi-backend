FROM node:20

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN apt-get update && apt-get install -y python3 make g++

RUN npm install pm2 -g

RUN npm install

COPY . .

EXPOSE 5000

RUN npm run build

CMD [  "pm2-runtime", "--no-auto-exit", "start", "./ecosystem.config.js",  "npx", "bunyan"]