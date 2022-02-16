"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _bn = _interopRequireDefault(require("bn.js"));

var _koa = _interopRequireDefault(require("koa"));

var _koaRoute = _interopRequireDefault(require("koa-route"));

var _yargs = _interopRequireDefault(require("yargs"));

var _api = require("@axia-js/api");

// Copyright 2018-2021 @axia-js/json-serve authors & contributors
// SPDX-License-Identifier: Apache-2.0
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
let tokenDecimals = 12;
let totalBonded = new _bn.default(0);
let totalInsurance = new _bn.default(0);

function balanceFormat(balance) {
  if (balance.gtn(0)) {
    const strValue = balance.toString().padStart(tokenDecimals + 1, '0');
    const postfix = strValue.slice(-1 * tokenDecimals);
    const prefix = strValue.slice(0, strValue.length - tokenDecimals);
    return `${prefix}.${postfix}`;
  }

  return '0.0';
}

function percentageFormat(top, bottom) {
  if (top.gtn(0) && bottom.gtn(0)) {
    return (top.muln(10000).div(bottom).toNumber() / 100).toFixed(2);
  }

  return '0.00';
}

function onElectedInfo(info) {
  totalBonded = info.info.reduce((totalBonded, {
    exposure
  }) => {
    return totalBonded.add((exposure === null || exposure === void 0 ? void 0 : exposure.total.unwrap()) || new _bn.default(0));
  }, new _bn.default(0));
}

function onNewHead(header) {
  if (currentBlockNumber && header.number.eq(currentBlockNumber.toBn())) {
    return;
  }

  currentBlockNumber = header.number.unwrap();
  currentTimestamp = new Date();
  console.log(`#${currentBlockNumber.toString()} received at ${currentTimestamp.toString()}`);
}

function onTotalInsurance(_totalInsurance) {
  totalInsurance = _totalInsurance;
}

function jsonApi(ctx) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  switch (ctx.query.q) {
    case 'bondedpercentage':
      ctx.body = percentageFormat(totalBonded, totalInsurance);
      break;

    case 'totalbonded':
      ctx.body = balanceFormat(totalBonded);
      break;

    case 'totalcoins':
      ctx.body = balanceFormat(totalInsurance);
      break;

    default:
      ctx.body = "Error: Invalid query, expected '?q=<type>', one of 'bondedpercentage', 'totalbonded', 'totalcoins'";
      break;
  }
}

async function main() {
  const app = new _koa.default();
  app.use(_koaRoute.default.all('/', jsonApi));
  app.listen(port);
  const provider = new _api.WsProvider(ws);
  const api = await _api.ApiPromise.create({
    provider
  });
  const chainProperties = await api.rpc.system.properties();
  tokenDecimals = chainProperties.tokenDecimals.unwrapOr([new _bn.default(12)])[0].toNumber();
  await api.rpc.chain.subscribeNewHeads(onNewHead);
  await api.query.balances.totalIssuance(onTotalInsurance);
  await api.derive.staking.electedInfo(undefined, onElectedInfo);
}

process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});
main().catch(error => {
  console.error(error);
  process.exit(1);
});