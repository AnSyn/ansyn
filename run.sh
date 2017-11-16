set -e

confd -onetime -backend ${CONFD_BACKEND:-env}

http-server -p -g 8081 --gzip
