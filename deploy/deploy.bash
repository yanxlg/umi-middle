#!/bin/bash

VERSION=$(cat /usr/share/nginx/html/version)
RELEASE="${ENV}_${VERSION}"

sed -i "s/::sentryRelease/${RELEASE}/g" `grep ::sentryRelease -rl /usr/share/nginx/html`
sed -i "s/::sentryEnv/${ENV}/g" `grep ::sentryEnv -rl /usr/share/nginx/html`
sed -i "s/::sensorProject/${SENSOR_PROJECT}/g" `grep ::sensorProject -rl /usr/share/nginx/html`
sed -i "s/::apiDomain/${apiDomain}/g" `grep ::apiDomain -rl /etc/nginx/nginx.conf`
sentry-cli releases new "$RELEASE"
sentry-cli releases files "$RELEASE" upload-sourcemaps /usr/share/nginx/html --url-prefix '~/'
sentry-cli releases finalize "$RELEASE"
find /usr/share/nginx/html -name "*.js.map" | xargs rm -rf

echo 'Done!'
