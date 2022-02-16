"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generator;

var _utilCrypto = require("@axia-js/util-crypto");

var _calculate = _interopRequireDefault(require("./calculate.cjs"));

// Copyright 2017-2021 @axia-js/vanitygen authors & contributors
// SPDX-License-Identifier: Apache-2.0
function generator(test, options) {
  const mnemonic = options.withHex ? undefined : (0, _utilCrypto.mnemonicGenerate)(12);
  const seed = mnemonic ? (0, _utilCrypto.mnemonicToMiniSecret)(mnemonic) : (0, _utilCrypto.randomAsU8a)();
  const pair = options.type === 'sr25519' ? (0, _utilCrypto.schnorrkelKeypairFromSeed)(seed) : (0, _utilCrypto.naclKeypairFromSeed)(seed);
  const address = (0, _utilCrypto.encodeAddress)(pair.publicKey, options.ss58Format);
  const {
    count,
    offset
  } = (0, _calculate.default)(test, address, options);
  return {
    address,
    count,
    mnemonic,
    offset,
    seed
  };
}