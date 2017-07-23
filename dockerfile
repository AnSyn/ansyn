FROM 223455578796.dkr.ecr.us-west-2.amazonaws.com/ansyn/nodeslim-confd

WORKDIR /mnt/opt/ansyn

RUN npm install -g http-server

COPY ./dist /opt/app/ansyn

CMD http-server -p 8081 -g
