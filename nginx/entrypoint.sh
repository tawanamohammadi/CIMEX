#!/bin/sh
set -e

CIMEX_HTTP_PORT=${CIMEX_HTTP_PORT:-80}
CIMEX_HTTPS_PORT=${CIMEX_HTTPS_PORT:-443}
CIMEX_SSL_DOMAIN=${CIMEX_SSL_DOMAIN:-REPLACE_DOMAIN}
PANEL_PORT=${PANEL_PORT:-8000}

# fallback to \$PANEL_PORT if upstream override not set
if [ -z "$CIMEX_PANEL_UPSTREAM" ]; then
  CIMEX_PANEL_UPSTREAM="http://127.0.0.1:${PANEL_PORT}"
fi

if [ "$CIMEX_HTTPS_PORT" = "443" ]; then
  CIMEX_HTTPS_REDIRECT_SUFFIX=""
else
  CIMEX_HTTPS_REDIRECT_SUFFIX=":$CIMEX_HTTPS_PORT"
fi

export CIMEX_HTTP_PORT
export CIMEX_HTTPS_PORT
export CIMEX_PANEL_UPSTREAM
export CIMEX_SSL_DOMAIN
export CIMEX_HTTPS_REDIRECT_SUFFIX

TEMPLATE_PATH="/etc/nginx/templates/default.conf.template"
TARGET_PATH="/etc/nginx/conf.d/default.conf"

mkdir -p "$(dirname "$TARGET_PATH")"

if [ ! -f "$TEMPLATE_PATH" ]; then
  echo "Missing nginx template at $TEMPLATE_PATH" >&2
  exit 1
fi

# substitute placeholders with actual values, but leave literal tokens for the base entrypoint
envsubst '$CIMEX_HTTP_PORT $CIMEX_HTTPS_PORT $CIMEX_HTTPS_REDIRECT_SUFFIX $CIMEX_PANEL_UPSTREAM $CIMEX_SSL_DOMAIN' < "$TEMPLATE_PATH" > "$TARGET_PATH"

exec nginx -g 'daemon off;'
