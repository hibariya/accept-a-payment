#!/bin/bash -e

if [[ "$#" -eq "0" ]]; then
  chmod 700 ~/.ssh

  npm install
  exec npm start
else
  exec "$@"
fi
