// Copyright 2018-2021 @axia-js/signer-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0
import * as readline from 'readline';
import { assert, isHex } from '@axia-js/util';
import { blake2AsHex } from '@axia-js/util-crypto';
export default class RawSigner {
  async signRaw({
    data
  }) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise(resolve => {
      const hashed = data.length > (256 + 1) * 2 ? blake2AsHex(data) : data;
      rl.question(`Payload: ${hashed}\nSignature> `, signature => {
        assert(isHex(signature), 'Supplied signature is not hex');
        resolve({
          id: 1,
          signature: signature.trim()
        });
        rl.close();
      });
    });
  }

}