"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generator;

var _generate = _interopRequireDefault(require("./generate.cjs"));

// Copyright 2017-2021 @axia-js/vanitygen authors & contributors
// SPDX-License-Identifier: Apache-2.0
function generator(options) {
  const {
    match,
    runs = 10,
    withCase = false
  } = options;
  const found = [];
  const startAt = Date.now();
  const test = (withCase ? match : match.toLowerCase()).split(',').map(c => c.split(''));

  while (found.length !== runs) {
    found.push((0, _generate.default)(test, options));
  }

  return {
    elapsed: Date.now() - startAt,
    found
  };
}