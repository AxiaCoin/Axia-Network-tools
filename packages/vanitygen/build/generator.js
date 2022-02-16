// Copyright 2017-2021 @axia-js/vanitygen authors & contributors
// SPDX-License-Identifier: Apache-2.0
import generate from "./generate.js";
export default function generator(options) {
  const {
    match,
    runs = 10,
    withCase = false
  } = options;
  const found = [];
  const startAt = Date.now();
  const test = (withCase ? match : match.toLowerCase()).split(',').map(c => c.split(''));

  while (found.length !== runs) {
    found.push(generate(test, options));
  }

  return {
    elapsed: Date.now() - startAt,
    found
  };
}