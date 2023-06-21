#!/bin/bash -e

chmod 700 ~/.ssh

if [[ "$#" -eq "0" ]]; then
  npm install
  exec npm start
else
  exec "$@"
fi
