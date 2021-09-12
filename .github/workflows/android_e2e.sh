#!/bin/bash -xe

cd custom-payment-flow/client/android-kotlin
#./gradlew installDebug
./gradlew assembleDebug
cd -

#appium &>/dev/null &
stripe listen --forward-to http://localhost:4242/webhook &

export STRIPE_WEBHOOK_SECRET=$(stripe listen --api-key $STRIPE_SECRET_KEY --print-secret)
cat <<EOF >> custom-payment-flow/server/go/.env
DOMAIN="$SERVER_URL"
PRICE=${PRICE}
PAYMENT_METHOD_TYPES="card"
EOF

export APPUIM_SERVER_URL="http://localhost:4723/wd/hub"
export APPIUM_APK_PATH=/Users/runner/work/accept-a-payment/accept-a-payment/custom-payment-flow/client/android-kotlin/app/build/outputs/apk/debug/app-debug.apk

cd custom-payment-flow/server/go
go run server.go &
cd -

#mkdir -p tmp
#command="bundle exec rspec spec/custom_payment_flow_android_spec.rb"
#$command \
#  || $command --only-failures \
#  || $command --only-failures --format RSpec::Github::Formatter --format progress

sleep 10
#adb shell am start -n com.example.app/com.example.app.LauncherActivity
#sleep 10
#adb shell am force-stop com.example.app
#sleep 10
#adb uninstall com.example.app
#sleep 10
#adb -e reboot
#sleep 90

#adb shell am start -a android.intent.action.VIEW -d https://www.stackoverflow.com
#sleep 5

#status=$?
kill $(jobs -p)
#exit $status

sleep 10
