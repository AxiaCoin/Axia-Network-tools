"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _koa = _interopRequireDefault(require("koa"));

var _koaRoute = _interopRequireDefault(require("koa-route"));

var _yargs = _interopRequireDefault(require("yargs"));

var _api = require("@axia-js/api");

// Copyright 2018-2021 @axia-js/monitor-rpc authors & contributors
// SPDX-License-Identifier: Apache-2.0
const MAX_ELAPSED = 60000;

const {
  port,
  ws
} = _yargs.default.options({
  port: {
    default: 9099,
    description: 'The HTTP port to listen on',
    required: true,
    type: 'number'
  },
  ws: {
    description: 'The endpoint to connect to, e.g. wss://axialunar-rpc.axia.io',
    required: true,
    type: 'string'
  }
}).argv;

let currentBlockNumber;
let currentTimestamp = new Date();

function checkDelay() {
  const elapsed = Date.now() - currentTimestamp.getTime();

  if (elapsed >= MAX_ELAPSED) {
    const secs = (elapsed / 1000).toFixed(2);
    currentBlockNumber && console.error(`ERROR: #${currentBlockNumber.toString()} received at ${currentTimestamp.toString()}, ${secs}s ago`);
  }
}

function updateCurrent(header) {
  if (currentBlockNumber && header.number.eq(currentBlockNumber.toBn())) {
    return;
  }

  currentBlockNumber = header.number.unwrap();
  currentTimestamp = new Date();
  console.log(`#${currentBlockNumber.toString()} received at ${currentTimestamp.toString()}`);
}

function httpStatus(ctx) {
  var _currentBlockNumber;

  const elapsed = Date.now() - currentTimestamp.getTime();
  ctx.body = {
    blockNumber: (_currentBlockNumber = currentBlockNumber) === null || _currentBlockNumber === void 0 ? void 0 : _currentBlockNumber.toNumber(),
    blockTimestamp: currentTimestamp.toISOString(),
    elapsed: elapsed / 1000,
    ok: elapsed < MAX_ELAPSED
  };
}

async function main() {
  const app = new _koa.default();
  app.use(_koaRoute.default.all('/', httpStatus));
  app.listen(port);
  const provider = new _api.WsProvider(ws);
  const api = await _api.ApiPromise.create({
    provider
  });
  await api.rpc.chain.subscribeNewHeads(updateCurrent);
  setInterval(checkDelay, 1000);
}

process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});
main().catch(error => {
  console.error(error);
  process.exit(1);
});