# Stage 1: Build
FROM node:9.5.0-slim as builder

WORKDIR /ng-app
COPY . .

RUN npm set progress=false \
  && npm config set depth 0 \
  && npm cache clean --force

RUN yarn install && npm run build:prod

# Stage 2: Setup
FROM nginx:1.13-alpine

RUN apk update \
  && apk add ca-certificates wget \
  && update-ca-certificates

COPY nginx/default.conf /etc/nginx/conf.d/

RUN rm -f /usr/share/nginx/html/*
COPY --from=builder /ng-app/dist /usr/share/nginx/html

COPY confd/conf.d/*.toml /etc/confd/conf.d/
COPY confd/templates/*.tmpl /etc/confd/templates/
COPY run.sh /usr/share/nginx/html

RUN chmod +x /usr/share/nginx/html/run.sh

RUN mkdir /opt \
  && wget https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-linux-amd64 -O /opt/confd \
  && chmod +x /opt/confd

CMD /usr/share/nginx/html/run.sh
