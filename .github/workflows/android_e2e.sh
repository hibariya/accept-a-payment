#!/bin/bash -xe

cd custom-payment-flow/client/android-kotlin
./gradlew installDebug
cd -

eval "$(docker-machine env default)"
source sample-ci/helpers.sh

install_docker_compose_settings
export STRIPE_WEBHOOK_SECRET=$(retrieve_webhook_secret)
cat <<EOF >> .env
DOMAIN="$SERVER_URL"
PRICE=${PRICE}
PAYMENT_METHOD_TYPES="card"
APPUIM_SERVER_URL="http://$(docker network inspect accept-a-payment_default | jq -r '.[0].IPAM.Config[0].Gateway'):4723/wd/hub"
APPIUM_APK_PATH=/home/runner/work/accept-a-payment/accept-a-payment/custom-payment-flow/client/android-kotlin/app/build/outputs/apk/debug/app-debug.apk
EOF

configure_docker_compose_for_integration custom-payment-flow node ../../client/html node:14.17
# TODO: FIXME
docker-compose up -d && docker-compose exec -T runner bash -c 'curl -I --retry 30 --retry-delay 3 --retry-connrefused http://web:4242'
command="docker-compose exec -T runner bundle exec rspec spec/custom_payment_flow_android_spec.rb"
$command \
  || $command --only-failures \
  || $command --only-failures --format RSpec::Github::Formatter --format progress
