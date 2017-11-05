FROM 223455578796.dkr.ecr.us-west-2.amazonaws.com/ansyn/nodeslim-confd

WORKDIR /opt/ansyn/app

RUN npm install -g http-server

RUN pwd

RUN ls

COPY ./dist /opt/ansyn/app

COPY ./confd/*.toml /etc/confd/conf.d/
COPY ./confd/*.tmpl /etc/confd/templates/

ADD ./run.sh /opt/ansyn/app

RUN chmod +x /opt/ansyn/app/run.sh

CMD ./run.sh
