// Copyright 2017-2021 @axia-js/vanitygen authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@axia-js/util-crypto/types';

export interface GeneratorCalculation {
  count: number;
  offset: number;
}

export interface GeneratorMatch extends GeneratorCalculation {
  address: string;
  mnemonic?: string;
  seed: Uint8Array;
}

export type GeneratorMatches = GeneratorMatch[];

export interface GeneratorOptions {
  atOffset?: number;
  match: string;
  network?: string;
  runs: number;
  ss58Format: number;
  type: KeypairType;
  withCase?: boolean;
  withHex?: boolean;
}

export interface GeneratorResult {
  elapsed: number;
  found: GeneratorMatches;
}
