#!/bin/bash -xe

cat <<EOF >> custom-payment-flow/server/java/.env
DOMAIN="http://10.0.2.2:4242"
PRICE="$PRICE"
PAYMENT_METHOD_TYPES="card"
STATIC_DIR="../../client/html"
EOF

export STRIPE_WEBHOOK_SECRET=$(stripe listen --api-key $STRIPE_SECRET_KEY --print-secret)
export APPUIM_SERVER_URL="http://localhost:4723/wd/hub"
export APPIUM_APK_PATH=/Users/runner/work/accept-a-payment/accept-a-payment/custom-payment-flow/client/android-kotlin/app/build/outputs/apk/debug/app-debug.apk

appium &>/dev/null &
stripe listen --forward-to http://localhost:4242/webhook &

cd custom-payment-flow/server/java
mvn package
java -cp target/sample-jar-with-dependencies.jar com.stripe.sample.Server &
cd -

cd custom-payment-flow/client/android-kotlin
./gradlew assembleDebug
cd -

curl -I --retry 30 --retry-delay 3 --retry-connrefused http://localhost:4242/

mkdir -p tmp
command="bundle exec rspec spec/custom_payment_flow_android_spec.rb"
$command \
  || $command --only-failures \
  || $command --only-failures --format RSpec::Github::Formatter --format progress

status=$?
kill $(jobs -p)
exit $status
