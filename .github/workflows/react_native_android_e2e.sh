#!/bin/bash -e

function killBackgroundJobs() {
  kill $(jobs -p)
}

trap killBackgroundJobs EXIT

export STRIPE_WEBHOOK_SECRET=$(stripe listen --api-key $STRIPE_SECRET_KEY --print-secret)
stripe listen --forward-to http://localhost:4242/webhook &

cd custom-payment-flow/server/java
cat <<EOF >> .env
DOMAIN="http://10.0.2.2:4242"
PRICE="$PRICE"
PAYMENT_METHOD_TYPES="card"
STATIC_DIR="../../client/html"
EOF
mvn package
java -cp target/sample-jar-with-dependencies.jar com.stripe.sample.Server &
curl -I --retry 30 --retry-delay 3 --retry-connrefused http://localhost:4242/
cd -

cd custom-payment-flow/client/react-native-expo
mkdir -p tmp/screenshots
npm install -g expo-cli
npm install # TODO: yarn?
npm run start -- --android &
sleep 60 # FIXME
npm run wdio -- wdio.android.ts
