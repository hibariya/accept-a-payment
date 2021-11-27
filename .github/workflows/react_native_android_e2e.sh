#!/bin/bash -e

function killBackgroundJobs() {
  kill $(jobs -p)
}

trap killBackgroundJobs EXIT

export STRIPE_WEBHOOK_SECRET=$(stripe listen --api-key $STRIPE_SECRET_KEY --print-secret)
stripe listen --forward-to http://localhost:4242/webhook &

cd custom-payment-flow/server/node
cat <<EOF >> .env
DOMAIN="http://10.0.2.2:4242"
PRICE="$PRICE"
PAYMENT_METHOD_TYPES="card"
STATIC_DIR="../../client/html"
EOF
npm install
npm start &
curl -I --retry 30 --retry-delay 3 --retry-connrefused http://localhost:4242/
cd -

cd custom-payment-flow/client/react-native-expo
mkdir -p tmp/screenshots
npm install -g expo-cli
npm install # TODO: yarn?
export REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1
(npm run start -- --android --no-dev &) &
sleep 30 # FIXME
npm run wdio -- wdio.android.ts
