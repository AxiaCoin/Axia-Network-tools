#!/usr/bin/env node
// Copyright 2017-2021 @axia-js/vanitygen authors & contributors
// SPDX-License-Identifier: Apache-2.0
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chalk = _interopRequireDefault(require("chalk"));

var _yargs = _interopRequireDefault(require("yargs"));

var _util = require("@axia-js/util");

var _utilCrypto = require("@axia-js/util-crypto");

var _generator = _interopRequireDefault(require("./generator.cjs"));

var _regex = _interopRequireDefault(require("./regex.cjs"));

const {
  match,
  mnemonic,
  network,
  type,
  withCase
} = _yargs.default.wrap(120).option('match', {
  default: 'Test',
  type: 'string'
}).option('mnemonic', {
  default: false,
  type: 'boolean'
}).option('network', {
  choices: ['axlib', 'axia', 'axialunar'],
  default: 'axlib'
}).option('type', {
  choices: ['ed25519', 'sr25519'],
  default: 'sr25519'
}).option('withCase', {
  default: false,
  type: 'boolean'
}).argv; // eslint-disable-next-line prefer-regex-literals


const NUMBER_REGEX = new RegExp('(\\d+?)(?=(\\d{3})+(?!\\d)|$)', 'g');
const INDICATORS = ['|', '/', '-', '\\'];
const options = {
  match,
  network,
  runs: 50,
  ss58Format: 42,
  type: type,
  withCase,
  withHex: !mnemonic
};
const startAt = Date.now();
let best = {
  address: '',
  count: -1,
  offset: 65536
};
let total = 0;
let indicator = -1;
const tests = options.match.split(',');
tests.forEach(test => {
  if (!_regex.default.test(test)) {
    console.error("Invalid character found in match string, allowed is '1-9' (no '0'), 'A-H, J-N & P-Z' (no 'I' or 'O'), 'a-k & m-z' (no 'l') and '?' (wildcard)");
    process.exit(-1);
  }
});

switch (network) {
  case 'axialunar':
    options.ss58Format = 2;
    break;

  case 'axia':
    options.ss58Format = 0;
    break;

  default:
    break;
}

console.log(options);

function showProgress() {
  const elapsed = (Date.now() - startAt) / 1000;
  indicator++;

  if (indicator === INDICATORS.length) {
    indicator = 0;
  }

  process.stdout.write(`\r[${INDICATORS[indicator]}] ${(total.toString().match(NUMBER_REGEX) || []).join(',')} keys in ${elapsed.toFixed(2)}s (${(total / elapsed).toFixed(0)} keys/s)`);
}

function showBest() {
  const {
    address,
    count,
    mnemonic,
    offset,
    seed
  } = best;
  console.log(`\r::: ${address.slice(0, offset)}${_chalk.default.cyan(address.slice(offset, count + offset))}${address.slice(count + offset)} <= ${(0, _util.u8aToHex)(seed)} (count=${count}, offset=${offset})${mnemonic ? '\n                                                        ' + mnemonic : ''}`);
}

process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});
(0, _utilCrypto.cryptoWaitReady)().then(() => {
  while (true) {
    const nextBest = (0, _generator.default)(options).found.reduce((best, match) => {
      if (match.count > best.count || match.count === best.count && match.offset <= best.offset) {
        return match;
      }

      return best;
    }, best);
    total += options.runs;

    if (nextBest.address !== best.address) {
      best = nextBest;
      showBest();
      showProgress();
    } else if (total % (options.withHex ? 1000 : 100) === 0) {
      showProgress();
    }
  }
}).catch(error => console.error(error));