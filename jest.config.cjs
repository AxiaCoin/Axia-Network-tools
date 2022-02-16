// Copyright 2018-2021 @axia-js/tools authors & contributors
// SPDX-License-Identifier: Apache-2.0

const config = require('@axia-js/dev/config/jest.cjs');

module.exports = {
  ...config,
  moduleNameMapper: {
    '@axia-js/api-cli(.*)$': '<rootDir>/packages/api-cli/src/$1',
    '@axia-js/monitor-rpc(.*)$': '<rootDir>/packages/monitor-rpc/src/$1'
  }
};
