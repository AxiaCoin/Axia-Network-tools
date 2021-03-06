// Copyright 2018-2021 @axia-js/signer-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Signer, SignerResult } from '@axia-js/api/types';
import type { SignerPayloadRaw } from '@axia-js/types/types';

import * as readline from 'readline';

import { assert, isHex } from '@axia-js/util';
import { blake2AsHex } from '@axia-js/util-crypto';

export default class RawSigner implements Signer {
  public async signRaw ({ data }: SignerPayloadRaw): Promise<SignerResult> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve): void => {
      const hashed = (data.length > (256 + 1) * 2)
        ? blake2AsHex(data)
        : data;

      rl.question(`Payload: ${hashed}\nSignature> `, (signature) => {
        assert(isHex(signature), 'Supplied signature is not hex');

        resolve({ id: 1, signature: signature.trim() });
        rl.close();
      });
    });
  }
}
