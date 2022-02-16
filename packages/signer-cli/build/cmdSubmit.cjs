"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cmdSubmit;

var _api = require("@axia-js/api");

var _util = require("@axia-js/util");

var _RawSigner = _interopRequireDefault(require("./RawSigner.cjs"));

// Copyright 2018-2021 @axia-js/signer-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0
function submitPreSignedTx(api, tx) {
  const extrinsic = api.createType('Extrinsic', tx); // eslint-disable-next-line @typescript-eslint/no-floating-promises

  api.rpc.author.submitAndWatchExtrinsic(extrinsic, result => {
    console.log((0, _util.stringify)(result.toHuman(), 2));

    if (result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
}

async function cmdSubmit(account, blocks, endpoint, tx, [txName, ...params]) {
  const api = await _api.ApiPromise.create({
    provider: new _api.WsProvider(endpoint)
  });

  if (tx) {
    return submitPreSignedTx(api, tx);
  }

  const [section, method] = txName.split('.');
  (0, _util.assert)(api.tx[section] && api.tx[section][method], `Unable to find method ${section}.${method}`);
  const options = {
    signer: new _RawSigner.default()
  };

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

  await api.tx[section][method](...params).signAndSend(account, options, result => {
    console.log((0, _util.stringify)(result.toHuman(), 2));

    if (result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
}