"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hexMiddleware = hexMiddleware;
exports.jsonMiddleware = jsonMiddleware;
exports.parseParams = parseParams;

var _fs = _interopRequireDefault(require("fs"));

var _util = require("@axia-js/util");

// Copyright 2018-2021 @axia-js/api-cli authors & contributors
// SPDX-License-Identifier: Apache-2.0
function asJson(_param) {
  const param = _param.toString();

  try {
    return JSON.parse(param);
  } catch (error) {
    return param;
  }
}

function hexMiddleware(argv) {
  // a parameter whose initial character is @ treated as a path and replaced
  // with the hexadecimal representation of the binary contents of that file
  argv._ = argv._.map(_param => {
    const param = _param.toString();

    if (param.startsWith('@')) {
      const path = param.substring(1);
      (0, _util.assert)(_fs.default.existsSync(path), `Cannot find path ${path}`);
      return `0x${_fs.default.readFileSync(path).toString('hex')}`;
    }

    return param;
  });
  return argv;
}

function jsonMiddleware(argv) {
  argv._ = argv._.map(asJson);
  return argv;
}

function parseParams(inline, file) {
  if (file) {
    (0, _util.assert)(_fs.default.existsSync(file), 'Cannot find supplied transaction parameters file');

    try {
      return _fs.default.readFileSync(file, 'utf8').split(' ').map(asJson);
    } catch (e) {
      (0, _util.assert)(false, 'Error loading supplied transaction parameters file');
    }
  }

  return inline;
}