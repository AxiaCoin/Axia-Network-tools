// Copyright 2018-2021 @axia-js/json-serve authors & contributors
// SPDX-License-Identifier: Apache-2.0
import BN from 'bn.js';
import Koa from 'koa';
import koaRoute from 'koa-route';
import yargs from 'yargs';
import { ApiPromise, WsProvider } from '@axia-js/api';
const {
  port,
  ws
} = yargs.options({
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
let totalBonded = new BN(0);
let totalInsurance = new BN(0);

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
    return totalBonded.add((exposure === null || exposure === void 0 ? void 0 : exposure.total.unwrap()) || new BN(0));
  }, new BN(0));
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
  const app = new Koa();
  app.use(koaRoute.all('/', jsonApi));
  app.listen(port);
  const provider = new WsProvider(ws);
  const api = await ApiPromise.create({
    provider
  });
  const chainProperties = await api.rpc.system.properties();
  tokenDecimals = chainProperties.tokenDecimals.unwrapOr([new BN(12)])[0].toNumber();
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