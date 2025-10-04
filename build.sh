#!/bin/sh

#-e means exit if anything fails
set -e

docker compose down --remove-orphans

#-d makes it detach from the terminal --wait waits for any health checks
docker compose up --build -d --wait

docker compose ps

#pushd is more standard than cd to make it easy to track what directory the script came from
pushd debugassist
npm run compile

pushd webview-ui
npm run build
popd

code --new-window --verbose \
  --extensions-dir "$(mktemp -d)" \
  --extensionDevelopmentPath="$(pwd)"
popd