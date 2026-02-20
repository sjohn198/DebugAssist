#!/bin/sh

#-e means exit if anything fails
set -e

if [ "$1" = "--render" ]; then
  echo "🚀 Booting in Cloud Mode: Pointing to Render backend..."
  # Replace this with your actual Render URL
  export BACKEND_URL="https://your-app-name.onrender.com/api/test-openai"
else
  docker compose down --remove-orphans

  #-d makes it detach from the terminal --wait waits for any health checks
  docker compose up --build -d --wait

  docker compose ps
fi

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