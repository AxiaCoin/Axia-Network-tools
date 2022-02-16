// Copyright 2018-2021 @axia-js/signer-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { ApiPromise, WsProvider } from '@axia-js/api';
import { assert } from '@axia-js/util';
import RawSigner from "./RawSigner.js";
export default async function cmdSendOffline(account, blocks, endpoint, nonce, [tx, ...params]) {
  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create({
    provider
  });
  const [section, method] = tx.split('.');
  assert(api.tx[section] && api.tx[section][method], `Unable to find method ${section}.${method}`);
  const options = {
    signer: new RawSigner()
  };

  if (!blocks && blocks !== 0) {
    blocks = 50;
  }

  if (!nonce && nonce !== 0) {
    options.nonce = (await api.derive.balances.account(account)).accountNonce;
  } else {
    options.nonce = nonce;
  }

  if (blocks === 0) {
    options.blockHash = api.genesisHash;
    options.era = 0;
  } else {
    // Get current block if we want to modify the number of blocks we have to sign
    const signedBlock = await api.rpc.chain.getBlock();
    options.blockHash = signedBlock.block.header.hash;
    options.era = api.createType('ExtrinsicEra', {
      current: signedBlock.block.header.number,
      period: blocks
    });
  }

  const transaction = api.tx[section][method](...params);
  await transaction.signAsync(account, options);
  console.log('\nSigned transaction:\n' + transaction.toJSON());
  process.exit(0);
}