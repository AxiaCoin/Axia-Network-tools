#!/bin/bash
# Copyright 2018-2021 @axia-js/tools authors & contributors
# SPDX-License-Identifier: Apache-2.0

# fail fast on any non-zero exits
set -e

# the option as passed on the commandline
CMD="$1"
shift

# execute the command specified
case $CMD in
  api)
    axia-js-api "$@"
    exit 0
    ;;
  json)
    axia-js-json-serve "$@"
    exit 0
    ;;
  metadata)
    axia-js-metadata-cmp "$@"
    exit 0
    ;;
  monitor)
    axia-js-monitor "$@"
    exit 0
    ;;
  signer)
    axia-js-signer "$@"
    exit 0
    ;;
  vanity)
    axia-js-vanitygen "$@"
    exit 0
    ;;
esac

echo "This executes axia-js cli commands."
echo ""
echo "Usage: <api|json|metadata|monitor|signer|vanity> [...options]"
echo ""
echo "Commands:"
echo "  api: Runs a cli interface to the api, use 'api --help' for options"
echo "  json: Exposes formatted queries via http, use `json --help` for options"
echo "  monitor: Runs a simple node monitor, use 'monitor --help' for options"
echo "  signer: Runs a simple offline signer, use 'signer --help' for options"
echo ""

exit 1
