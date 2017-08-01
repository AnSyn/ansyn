set -e

confd -onetime -backend ${CONFD_BACKEND:-env}

http-server -p 8081