/**
 * unit/utils/cryptoUtils.test.js
 * Converted from node:test to Jest.
 */

import { encrypt, decrypt } from "../../../src/utils/cryptoUtils.js";

beforeAll(() => {
  process.env.MESSAGE_ENCRYPTION_KEY =
    "7e8b9f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c";
  process.env.NODE_ENV = "test";
});

describe("cryptoUtils", () => {
  test("encrypt -> decrypt round-trip", () => {
    const plaintext = "Hello, this is a secret message!";
    const ciphertext = encrypt(plaintext);

    expect(ciphertext).not.toBe(plaintext);
    expect(ciphertext).toEqual(expect.stringContaining(":")); // iv:authTag:encryptedHex

    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  test("fallback handles invalid ciphertext gracefully", () => {
    const invalidCiphertext = "invalid:ciphertext:format";
    const decrypted = decrypt(invalidCiphertext);
    expect(decrypted).toBe("[Encrypted Message]");
  });
});