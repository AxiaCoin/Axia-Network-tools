// Copyright 2018-2021 @axia-js/signer-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerOptions } from '@axia-js/api/submittable/types';

import { ApiPromise, WsProvider } from '@axia-js/api';
import { assert, stringify } from '@axia-js/util';

import RawSigner from './RawSigner';

function submitPreSignedTx (api: ApiPromise, tx: string): void {
  const extrinsic = api.createType('Extrinsic', tx);

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  api.rpc.author.submitAndWatchExtrinsic(extrinsic, (result) => {
    console.log(stringify(result.toHuman(), 2));

    if (result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
}

export default async function cmdSubmit (account: string, blocks: number | undefined, endpoint: string, tx: string | undefined, [txName, ...params]: string[]): Promise<void> {
  const api = await ApiPromise.create({ provider: new WsProvider(endpoint) });

  if (tx) {
    return submitPreSignedTx(api, tx);
  }

  const [section, method] = txName.split('.');

  assert(api.tx[section] && api.tx[section][method], `Unable to find method ${section}.${method}`);

  const options: Partial<SignerOptions> = { signer: new RawSigner() };

  if (blocks === 0) {
    options.era = 0;
  } else if (blocks != null) {
    // Get current block if we want to modify the number of blocks we have to sign
    const signedBlock = await api.rpc.chain.getBlock();

    options.blockHash = signedBlock.block.header.hash;
    options.era = api.createType('ExtrinsicEra', {
      current: signedBlock.block.header.number,
      period: blocks
    });
  }

  await api.tx[section][method](...params).signAndSend(account, options, (result): void => {
    console.log(stringify(result.toHuman(), 2));

    if (result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
}
