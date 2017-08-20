FROM node:slim

WORKDIR /mnt/app/ansyn

RUN npm install -g http-server

COPY ./dist /mnt/app/ansyn

CMD http-server -p 8081 -g
ng s
