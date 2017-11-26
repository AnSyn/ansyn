set -e

confd -onetime -backend ${CONFD_BACKEND:-env}

http-server -g -p 8081 --gzip
