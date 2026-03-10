'use strict';

/**
 * packages/adapters/common/utils.js
 *
 * Shared utility helpers used across adapter implementations.
 * No external dependencies.
 */

/**
 * Generate a random hexadecimal string of exactly `len` characters.
 * Used to produce mock transaction hashes in stub adapters.
 *
 * @param {number} len
 * @returns {string}
 */
function randomHex(len) {
  let hex = '';
  while (hex.length < len) {
    hex += Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, '0');
  }
  return hex.slice(0, len);
}

/**
 * Generate a short random identifier for backend references.
 * Format: <base36-timestamp>-<base36-random>
 *
 * @returns {string}
 */
function randomId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

module.exports = { randomHex, randomId };
