![license](https://img.shields.io/badge/License-Apache%202.0-blue?logo=apache&style=flat-square)
[![npm](https://img.shields.io/npm/v/@axia-js/api-cli?logo=npm&style=flat-square)](https://www.npmjs.com/package/@axia-js/api-cli)
[![beta](https://img.shields.io/npm/v/@axia-js/api-cli/beta?label=beta&logo=npm&style=flat-square)](https://www.npmjs.com/package/@axia-js/api-cli)

# @axia-js/tools

This is a collection of cli tools to use on AXIA Network.

## Overview

The repo is split up into a number of internal packages -

- [@axia-js/api-cli](packages/api-cli/) A cli tool to allow you to make API calls to any running node
- [@axia-js/json-serve](packages/json-serve/) A server that serves JSON outputs for specific queries
- [@axia-js/monitor-rpc](packages/monitor-rpc/) A simple monitoring interface that checks the health of a remote node via RPC
- [@axia-js/signer-cli](packages/signer-cli/) A cli tool that allows you to generate transactions in one terminal and sign them in another terminal (or computer)
- [@axia-js/vanitygen](packages/vanitygen/) Generate vanity addresses, matching some pattern

## Installation

You can install the packages globally via npm, i.e.

```
# api-cli or monitor-rpc or ...
npm install -g @axia-js/api-cli
```

And then you can execute it via `axia-js-api [...options]` or `axia-js-monitor [...options]`

## Docker

Alternatively a docker image is provided as well (or you can build your own from this repo). Usage is as follow -

```
docker run jacogr/axia-js-tools <api|json|metadata|monitor|signer|vanity> [...options | --help]
```

With docker, if you are connecting to a local node for the API or monitor (or signer where the transaction is generated, i.e. the sign process is offline), and use the (default) `127.0.0.1` host, you would need to pass `--network=host` as a flag, i.e. `docker run --network=host ...` and pass the appropriate flags to the node to allow connections for docker.

## Development

Contributions are welcome!
