"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _fs = _interopRequireDefault(require("fs"));

var _yargs = _interopRequireDefault(require("yargs"));

var _api = require("@axia-js/api");

var _keyring = require("@axia-js/keyring");

var _util = require("@axia-js/util");

var _cli = require("./cli.cjs");

// Copyright 2018-2021 @axia-js/api-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0
const CRYPTO = ['ed25519', 'sr25519', 'ethereum']; // retrieve and parse arguments - we do this globally, since this is a single command

const argv = _yargs.default.parserConfiguration({
  'parse-numbers': false,
  'parse-positional-numbers': false
}).command('$0', `Usage: [options] <endpoint> <...params>
Example: query.system.account 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKv3gB
Example: query.axlib.code --info
Example: --seed "//Alice" tx.balances.transfer F7Gh 10000`).middleware(_cli.hexMiddleware).middleware(_cli.jsonMiddleware).wrap(120).options({
  info: {
    description: 'Shows the meta information for the call',
    type: 'boolean'
  },
  noWait: {
    description: 'After sending a tx return immediately and don\'t wait until it is included in a block',
    type: 'boolean'
  },
  params: {
    description: 'Location of file containing space-separated transaction parameters (optional)',
    type: 'string'
  },
  seed: {
    description: 'The account seed to use (required for tx.* only)',
    type: 'string'
  },
  sign: {
    choices: CRYPTO,
    default: 'sr25519',
    description: 'The account crypto signature to use (required fo tx.* only)',
    type: 'string'
  },
  sub: {
    description: 'With this flag set, perform subscription, running until exited with ^C',
    type: 'boolean'
  },
  sudo: {
    description: 'Run this tx as a wrapped sudo.sudo call',
    type: 'boolean'
  },
  sudoUncheckedWeight: {
    description: 'Run this tx as a wrapped sudo.sudoUncheckedWeight call with weight',
    type: 'string'
  },
  types: {
    description: 'Add this .json file as types to the API constructor',
    type: 'string'
  },
  ws: {
    default: 'ws://127.0.0.1:9944',
    description: 'The API endpoint to connect to, e.g. wss://axialunar-rpc.axia.io',
    required: true,
    type: 'string'
  }
}).argv;

const {
  _: [endpoint, ...paramsInline],
  info,
  noWait,
  params: paramsFile,
  seed,
  sign,
  sub,
  sudo,
  sudoUncheckedWeight,
  types,
  ws
} = argv;
const params = (0, _cli.parseParams)(paramsInline, paramsFile);

function readTypes() {
  if (!types) {
    return {};
  }

  (0, _util.assert)(_fs.default.existsSync(types), `Unable to read .json file at ${types}`);
  return JSON.parse(_fs.default.readFileSync(types, 'utf8'));
} // parse the arguments and retrieve the details of what we want to do


async function getCallInfo() {
  (0, _util.assert)(endpoint && endpoint.includes('.'), 'You need to specify the command to execute, e.g. query.system.account');
  const provider = new _api.WsProvider(ws);
  const api = await _api.ApiPromise.create({
    provider,
    types: readTypes()
  });
  const apiExt = api;
  const [type, section, method] = endpoint.split('.');
  (0, _util.assert)(['consts', 'derive', 'query', 'rpc', 'tx'].includes(type), `Expected one of consts, derive, query, rpc, tx, found ${type}`);
  (0, _util.assert)(apiExt[type][section], `Cannot find ${type}.${section}`);
  (0, _util.assert)(apiExt[type][section][method], `Cannot find ${type}.${section}.${method}`);
  const fn = apiExt[type][section][method];
  return {
    api,
    fn,
    log: result => console.log((0, _util.stringify)({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      [method]: (0, _util.isFunction)(result.toHuman) ? result.toHuman() : result
    }, 2)),
    method,
    section,
    type
  };
} // retrieve consts


function logConst({
  fn,
  log
}) {
  log(fn);
  process.exit(0);
} // log the details of a specific endpoint


function logDetails({
  fn: {
    description,
    meta
  },
  method,
  section
}) {
  console.log(`# ${section}.${method}\n`);

  if (description) {
    console.log(description);
  } else if (meta) {
    meta.docs.forEach(d => console.log(d.toString()));
  } else {
    console.log('No documentation available');
  } // Empty line at the end to make it pretty


  console.log();
  process.exit(0);
}

function isCrypto(type) {
  if (CRYPTO.includes(type)) {
    return true;
  }

  return false;
} // send a transaction


async function makeTx({
  api,
  fn,
  log
}) {
  (0, _util.assert)(seed, 'You need to specify an account seed with tx.*');
  (0, _util.assert)(CRYPTO.includes(sign), `The crypto type can only be one of ${CRYPTO.join(', ')} found '${sign}'`);
  const keyring = new _keyring.Keyring();
  const auth = keyring.createFromUri(seed, {}, isCrypto(sign) ? sign : undefined);
  let signable;

  if (sudo || sudoUncheckedWeight) {
    const adminId = await api.query.sudo.key();
    (0, _util.assert)(adminId.eq(auth.address), 'Supplied seed does not match on-chain sudo key');

    if (sudoUncheckedWeight) {
      signable = api.tx.sudo.sudoUncheckedWeight(fn(...params), sudoUncheckedWeight);
    } else {
      signable = api.tx.sudo.sudo(fn(...params));
    }
  } else {
    signable = fn(...params);
  }

  return signable.signAndSend(auth, result => {
    log(result);

    if (noWait || result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
} // make a derive, query or rpc call
// eslint-disable-next-line @typescript-eslint/require-await


async function makeCall({
  fn,
  log,
  method,
  type
}) {
  const isRpcSub = type === 'rpc' && method.startsWith('subscribe');
  return sub || isRpcSub ? fn(...params, log).then(() => {// ignore, we keep trucking on
  }) : fn(...params).then(log).then(() => {
    process.exit(0);
  });
} // our main entry point - from here we call out


async function main() {
  const callInfo = await getCallInfo();

  if (info) {
    return logDetails(callInfo);
  } else if (callInfo.type === 'consts') {
    return logConst(callInfo);
  } else if (callInfo.type === 'tx') {
    return makeTx(callInfo);
  }

  return makeCall(callInfo);
}

process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});
main().catch(error => {
  console.error(error);
  process.exit(1);
});