"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cmdSign;

var readline = _interopRequireWildcard(require("readline"));

var _keyring = require("@axia-js/keyring");

var _util = require("@axia-js/util");

var _utilCrypto = require("@axia-js/util-crypto");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Copyright 2018-2021 @axia-js/signer-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0
const SEED_LENGTHS = [12, 15, 18, 21, 24];
/**
  * Seed here can be any of the following:
  *  - mnemonic (with/without derivation path): <mnemonic>[//<hard>/<soft>///<password>]
  *  - hex seed (with/without derivation path): <hex>[//<hard>/<soft>///<password>]
*/

function validateSeed(suri) {
  const {
    phrase
  } = (0, _utilCrypto.keyExtractSuri)(suri);

  if ((0, _util.isHex)(phrase)) {
    (0, _util.assert)((0, _util.isHex)(phrase, 256), 'Hex seed needs to be 256-bits');
  } else {
    // sadly isHex detects as string, so we need a cast here
    (0, _util.assert)(SEED_LENGTHS.includes(phrase.split(' ').length), `Mnemonic needs to contain ${SEED_LENGTHS.join(', ')} words`);
    (0, _util.assert)((0, _utilCrypto.mnemonicValidate)(phrase), 'Not a valid mnemonic seed');
  }
}

function validatePayload(payload) {
  (0, _util.assert)(payload && payload.length > 0, 'Cannot sign empty payload. Please check your input and try again.');
  (0, _util.assert)((0, _util.isHex)(payload), 'Payload must be supplied as a hex string. Please check your input and try again.');
}

function createSignature(pair, payload) {
  validatePayload(payload);
  const signature = pair.sign((0, _util.hexToU8a)(payload), {
    withType: true
  });
  console.log(`Signature: ${(0, _util.u8aToHex)(signature)}`);
  process.exit(0);
}

async function cmdSign(_, suri, type, [payload]) {
  validateSeed(suri);
  await (0, _utilCrypto.cryptoWaitReady)();
  const keyring = new _keyring.Keyring({
    type
  });
  const pair = keyring.createFromUri(suri);

  if (!payload) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Payload> ', payload => {
      createSignature(pair, payload.trim());
      rl.close();
    });
  } else {
    createSignature(pair, payload.trim());
  }
}