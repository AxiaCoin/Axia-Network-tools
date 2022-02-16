// Copyright 2017-2021 @axia-js/vanitygen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { encodeAddress, mnemonicGenerate, mnemonicToMiniSecret, naclKeypairFromSeed, randomAsU8a, schnorrkelKeypairFromSeed } from '@axia-js/util-crypto';
import calculate from "./calculate.js";
export default function generator(test, options) {
  const mnemonic = options.withHex ? undefined : mnemonicGenerate(12);
  const seed = mnemonic ? mnemonicToMiniSecret(mnemonic) : randomAsU8a();
  const pair = options.type === 'sr25519' ? schnorrkelKeypairFromSeed(seed) : naclKeypairFromSeed(seed);
  const address = encodeAddress(pair.publicKey, options.ss58Format);
  const {
    count,
    offset
  } = calculate(test, address, options);
  return {
    address,
    count,
    mnemonic,
    offset,
    seed
  };
}