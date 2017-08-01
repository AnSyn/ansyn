FROM 223455578796.dkr.ecr.us-west-2.amazonaws.com/ansyn/nodeslim-confd

WORKDIR /opt/ansyn/app

RUN npm install -g http-server

COPY ./dist /opt/ansyn/app

ADD ./run.sh /opt/ansyn/app

RUN chmod +x /opt/ansyn/app/run.sh

CMD ./run.sh
