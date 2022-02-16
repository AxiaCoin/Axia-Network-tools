"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _yargs = _interopRequireDefault(require("yargs"));

var _cli = require("@axia-js/api-cli/cli");

var _cmdSendOffline = _interopRequireDefault(require("./cmdSendOffline.cjs"));

var _cmdSign = _interopRequireDefault(require("./cmdSign.cjs"));

var _cmdSubmit = _interopRequireDefault(require("./cmdSubmit.cjs"));

// Copyright 2018-2021 @axia-js/signer-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0
const BLOCKTIME = 6;
const ONE_MINUTE = 60 / BLOCKTIME;

const {
  _: [command, ...paramsInline],
  account,
  blocks,
  minutes,
  nonce,
  params: paramsFile,
  seed,
  type,
  ws,
  tx
} = _yargs.default.usage('Usage: [options] <endpoint> <...params>').usage('Example: submit --account D3AhD...wrx --ws wss://... balances.transfer F7Gh 10000 ').usage('Example: sign --seed "..." --account D3AhD...wrx --type ed25519 0x123...789').usage('Example: sendOffline --seed "..." --account D3AhD...wrx --type ed25519 0x123...789').middleware(_cli.hexMiddleware).middleware(_cli.jsonMiddleware).wrap(120).options({
  account: {
    description: 'The actual address for the signer',
    type: 'string'
  },
  blocks: {
    default: undefined,
    description: 'Exact number of blocks for a transaction to be signed and submitted before becoming invalid (mortality in blocks). Set to 0 for an immortal transaction (not recommended)',
    type: 'number'
  },
  minutes: {
    default: undefined,
    description: 'Approximate time for a transaction to be signed and submitted before becoming invalid (mortality in minutes)',
    type: 'number'
  },
  nonce: {
    default: undefined,
    description: 'Transaction nonce (sendOffline only)',
    type: 'number'
  },
  params: {
    description: 'Location of file containing space-separated transaction parameters (optional)',
    type: 'string'
  },
  seed: {
    description: 'The account seed to use (sign only)',
    type: 'string'
  },
  tx: {
    description: 'Pre-signed transaction generated using e.g. the sendOffline command. If provided, only --ws is required as well (submit only)',
    type: 'string'
  },
  type: {
    choices: ['ed25519', 'sr25519'],
    default: 'sr25519',
    description: 'The account crypto signature to use (sign only)',
    type: 'string'
  },
  ws: {
    description: 'The API endpoint to connect to, e.g. wss://axialunar-rpc.axia.io (submit and sendOffline only)',
    type: 'string'
  }
}).parserConfiguration({
  'parse-numbers': false,
  'parse-positional-numbers': false
}).argv;

const params = (0, _cli.parseParams)(paramsInline, paramsFile); // our main entry point - from here we call out
// eslint-disable-next-line @typescript-eslint/require-await

async function main() {
  if (command === 'sign') {
    return (0, _cmdSign.default)(account, seed || '', type, params);
  } else if (command === 'submit') {
    const mortality = minutes != null ? minutes * ONE_MINUTE : blocks;
    return (0, _cmdSubmit.default)(account, mortality, ws || '', tx, params);
  } else if (command === 'sendOffline') {
    const mortality = minutes != null ? minutes * ONE_MINUTE : blocks;
    return (0, _cmdSendOffline.default)(account, mortality, ws || '', nonce, params);
  }

  throw new Error(`Unknown command '${command}' found, expected one of 'sign', 'submit' or 'sendOffline'`);
}

process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});
main().catch(error => {
  console.error(error);
  process.exit(1);
});