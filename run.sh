set -e

confd -onetime -backend ${CONFD_BACKEND:-env}

nginx -g 'daemon off;'
