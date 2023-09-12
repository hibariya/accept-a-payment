#!/bin/bash -xe

source ../sample-ci/helpers.sh

export SAMPLE=${1}
export SERVER_TYPE=${2}
export STATIC_DIR=${3:-../../client/html}
export SERVER_IMAGE=${4}

if [ "$STATIC_DIR" = "../../client/html" ]
then
  export WORKING_DIR="${SAMPLE}/server/${SERVER_TYPE}"
  export SERVICE="web"
  export RUN_SERVICES='["runner"]'
  export PORT=4242
else
  export WORKING_DIR="${SAMPLE}/client/$(basename "$STATIC_DIR")"
  export SERVICE="frontend"
  export RUN_SERVICES='["runner", "frontend"]'
  export PORT=3000
fi


CONFIG_DIR=$(echo "$WORKING_DIR" | tr / -)
mkdir -p "$CONFIG_DIR"
cat devcontainer-template.json | envsubst '$WORKING_DIR $SERVICE $RUN_SERVICES $PORT' > "$CONFIG_DIR/devcontainer.json"
cat docker-compose.override.yml | envsubst '$STATIC_DIR' > "$CONFIG_DIR/docker-compose.override.yml"

pushd "$CONFIG_DIR"
ln -sF ../../sample-ci .
install_docker_compose_settings_for_integration ${SAMPLE} ${SERVER_TYPE} ${STATIC_DIR} ${SERVER_IMAGE}
rm -f sample-ci
ln -sF ../.env .
popd

